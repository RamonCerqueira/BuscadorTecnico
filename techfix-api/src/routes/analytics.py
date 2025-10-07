from flask import Blueprint, request, jsonify
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime, timedelta
import json
from sqlalchemy import func, text
from src.models.user import db, User
from src.models.ticket import Ticket
from src.routes.scheduling import Appointment
import io
import base64

analytics_bp = Blueprint('analytics', __name__)

class AnalyticsService:
    def __init__(self):
        self.colors = {
            'primary': '#3B82F6',
            'secondary': '#10B981',
            'warning': '#F59E0B',
            'danger': '#EF4444',
            'info': '#06B6D4',
            'success': '#22C55E'
        }
    
    def get_dashboard_metrics(self, date_from=None, date_to=None, user_id=None, user_type=None):
        """Obter métricas principais do dashboard"""
        try:
            # Definir período padrão (últimos 30 dias)
            if not date_from:
                date_from = datetime.now() - timedelta(days=30)
            else:
                date_from = datetime.strptime(date_from, '%Y-%m-%d')
            
            if not date_to:
                date_to = datetime.now()
            else:
                date_to = datetime.strptime(date_to, '%Y-%m-%d')
            
            # Filtros baseados no usuário
            ticket_query = Ticket.query.filter(
                Ticket.created_at >= date_from,
                Ticket.created_at <= date_to
            )
            
            if user_type == 'technician' and user_id:
                ticket_query = ticket_query.filter_by(assigned_technician_id=user_id)
            elif user_type == 'client' and user_id:
                ticket_query = ticket_query.filter_by(client_id=user_id)
            
            # Métricas básicas
            total_tickets = ticket_query.count()
            open_tickets = ticket_query.filter(Ticket.status.in_(['open', 'in_progress'])).count()
            closed_tickets = ticket_query.filter_by(status='closed').count()
            cancelled_tickets = ticket_query.filter_by(status='cancelled').count()
            
            # Taxa de resolução
            resolution_rate = (closed_tickets / total_tickets * 100) if total_tickets > 0 else 0
            
            # Tempo médio de resolução
            closed_tickets_with_time = ticket_query.filter(
                Ticket.status == 'closed',
                Ticket.closed_at.isnot(None)
            ).all()
            
            if closed_tickets_with_time:
                resolution_times = []
                for ticket in closed_tickets_with_time:
                    resolution_time = (ticket.closed_at - ticket.created_at).total_seconds() / 3600  # horas
                    resolution_times.append(resolution_time)
                avg_resolution_time = sum(resolution_times) / len(resolution_times)
            else:
                avg_resolution_time = 0
            
            # Satisfação do cliente (baseado em avaliações)
            rated_tickets = ticket_query.filter(Ticket.rating.isnot(None)).all()
            if rated_tickets:
                avg_rating = sum(ticket.rating for ticket in rated_tickets) / len(rated_tickets)
                satisfaction_rate = (avg_rating / 5) * 100
            else:
                avg_rating = 0
                satisfaction_rate = 0
            
            # Receita (se disponível)
            revenue_query = ticket_query.filter(Ticket.final_cost.isnot(None))
            total_revenue = sum(ticket.final_cost for ticket in revenue_query.all())
            
            # Agendamentos
            appointment_query = Appointment.query.filter(
                Appointment.created_at >= date_from,
                Appointment.created_at <= date_to
            )
            
            if user_type == 'technician' and user_id:
                appointment_query = appointment_query.filter_by(technician_id=user_id)
            elif user_type == 'client' and user_id:
                appointment_query = appointment_query.filter_by(client_id=user_id)
            
            total_appointments = appointment_query.count()
            completed_appointments = appointment_query.filter_by(status='completed').count()
            
            return {
                'period': {
                    'from': date_from.isoformat(),
                    'to': date_to.isoformat()
                },
                'tickets': {
                    'total': total_tickets,
                    'open': open_tickets,
                    'closed': closed_tickets,
                    'cancelled': cancelled_tickets,
                    'resolution_rate': round(resolution_rate, 2)
                },
                'performance': {
                    'avg_resolution_time_hours': round(avg_resolution_time, 2),
                    'avg_rating': round(avg_rating, 2),
                    'satisfaction_rate': round(satisfaction_rate, 2)
                },
                'financial': {
                    'total_revenue': total_revenue,
                    'avg_ticket_value': round(total_revenue / total_tickets, 2) if total_tickets > 0 else 0
                },
                'appointments': {
                    'total': total_appointments,
                    'completed': completed_appointments,
                    'completion_rate': round((completed_appointments / total_appointments * 100), 2) if total_appointments > 0 else 0
                }
            }
            
        except Exception as e:
            print(f"Erro ao obter métricas do dashboard: {e}")
            return {'error': str(e)}
    
    def get_tickets_by_status_chart(self, date_from=None, date_to=None, user_id=None, user_type=None):
        """Gráfico de tickets por status"""
        try:
            # Definir período
            if not date_from:
                date_from = datetime.now() - timedelta(days=30)
            else:
                date_from = datetime.strptime(date_from, '%Y-%m-%d')
            
            if not date_to:
                date_to = datetime.now()
            else:
                date_to = datetime.strptime(date_to, '%Y-%m-%d')
            
            # Query com filtros
            query = db.session.query(
                Ticket.status,
                func.count(Ticket.id).label('count')
            ).filter(
                Ticket.created_at >= date_from,
                Ticket.created_at <= date_to
            )
            
            if user_type == 'technician' and user_id:
                query = query.filter_by(assigned_technician_id=user_id)
            elif user_type == 'client' and user_id:
                query = query.filter_by(client_id=user_id)
            
            results = query.group_by(Ticket.status).all()
            
            # Preparar dados
            statuses = []
            counts = []
            colors = []
            
            status_colors = {
                'open': self.colors['info'],
                'in_progress': self.colors['warning'],
                'closed': self.colors['success'],
                'cancelled': self.colors['danger']
            }
            
            for status, count in results:
                statuses.append(status.title())
                counts.append(count)
                colors.append(status_colors.get(status, self.colors['primary']))
            
            # Criar gráfico
            fig = go.Figure(data=[
                go.Pie(
                    labels=statuses,
                    values=counts,
                    marker_colors=colors,
                    hole=0.4,
                    textinfo='label+percent+value',
                    textposition='outside'
                )
            ])
            
            fig.update_layout(
                title='Distribuição de Tickets por Status',
                font=dict(size=12),
                showlegend=True,
                height=400
            )
            
            return fig.to_json()
            
        except Exception as e:
            print(f"Erro ao gerar gráfico de status: {e}")
            return None
    
    def get_tickets_timeline_chart(self, date_from=None, date_to=None, user_id=None, user_type=None):
        """Gráfico de linha temporal de tickets"""
        try:
            # Definir período
            if not date_from:
                date_from = datetime.now() - timedelta(days=30)
            else:
                date_from = datetime.strptime(date_from, '%Y-%m-%d')
            
            if not date_to:
                date_to = datetime.now()
            else:
                date_to = datetime.strptime(date_to, '%Y-%m-%d')
            
            # Query para tickets criados por dia
            query = db.session.query(
                func.date(Ticket.created_at).label('date'),
                func.count(Ticket.id).label('created')
            ).filter(
                Ticket.created_at >= date_from,
                Ticket.created_at <= date_to
            )
            
            if user_type == 'technician' and user_id:
                query = query.filter_by(assigned_technician_id=user_id)
            elif user_type == 'client' and user_id:
                query = query.filter_by(client_id=user_id)
            
            created_results = query.group_by(func.date(Ticket.created_at)).all()
            
            # Query para tickets fechados por dia
            closed_query = db.session.query(
                func.date(Ticket.closed_at).label('date'),
                func.count(Ticket.id).label('closed')
            ).filter(
                Ticket.closed_at >= date_from,
                Ticket.closed_at <= date_to,
                Ticket.status == 'closed'
            )
            
            if user_type == 'technician' and user_id:
                closed_query = closed_query.filter_by(assigned_technician_id=user_id)
            elif user_type == 'client' and user_id:
                closed_query = closed_query.filter_by(client_id=user_id)
            
            closed_results = closed_query.group_by(func.date(Ticket.closed_at)).all()
            
            # Preparar dados
            dates = pd.date_range(start=date_from, end=date_to, freq='D')
            
            created_data = {str(date): 0 for date in created_results}
            for date, count in created_results:
                created_data[str(date)] = count
            
            closed_data = {str(date): 0 for date in closed_results}
            for date, count in closed_results:
                closed_data[str(date)] = count
            
            # Criar DataFrame
            df = pd.DataFrame({
                'date': dates,
                'created': [created_data.get(str(date.date()), 0) for date in dates],
                'closed': [closed_data.get(str(date.date()), 0) for date in dates]
            })
            
            # Criar gráfico
            fig = go.Figure()
            
            fig.add_trace(go.Scatter(
                x=df['date'],
                y=df['created'],
                mode='lines+markers',
                name='Tickets Criados',
                line=dict(color=self.colors['primary'], width=2),
                marker=dict(size=6)
            ))
            
            fig.add_trace(go.Scatter(
                x=df['date'],
                y=df['closed'],
                mode='lines+markers',
                name='Tickets Fechados',
                line=dict(color=self.colors['success'], width=2),
                marker=dict(size=6)
            ))
            
            fig.update_layout(
                title='Timeline de Tickets',
                xaxis_title='Data',
                yaxis_title='Quantidade',
                hovermode='x unified',
                height=400
            )
            
            return fig.to_json()
            
        except Exception as e:
            print(f"Erro ao gerar gráfico de timeline: {e}")
            return None
    
    def get_technician_performance_chart(self, date_from=None, date_to=None):
        """Gráfico de performance dos técnicos"""
        try:
            # Definir período
            if not date_from:
                date_from = datetime.now() - timedelta(days=30)
            else:
                date_from = datetime.strptime(date_from, '%Y-%m-%d')
            
            if not date_to:
                date_to = datetime.now()
            else:
                date_to = datetime.strptime(date_to, '%Y-%m-%d')
            
            # Query para performance dos técnicos
            query = db.session.query(
                User.name,
                func.count(Ticket.id).label('total_tickets'),
                func.sum(func.case([(Ticket.status == 'closed', 1)], else_=0)).label('closed_tickets'),
                func.avg(Ticket.rating).label('avg_rating')
            ).join(
                Ticket, User.id == Ticket.assigned_technician_id
            ).filter(
                User.user_type == 'technician',
                Ticket.created_at >= date_from,
                Ticket.created_at <= date_to
            ).group_by(User.id, User.name).all()
            
            if not query:
                return None
            
            # Preparar dados
            technicians = []
            total_tickets = []
            closed_tickets = []
            ratings = []
            
            for name, total, closed, rating in query:
                technicians.append(name)
                total_tickets.append(total)
                closed_tickets.append(closed or 0)
                ratings.append(round(rating or 0, 2))
            
            # Criar gráfico de barras
            fig = go.Figure()
            
            fig.add_trace(go.Bar(
                name='Total de Tickets',
                x=technicians,
                y=total_tickets,
                marker_color=self.colors['primary'],
                yaxis='y'
            ))
            
            fig.add_trace(go.Bar(
                name='Tickets Fechados',
                x=technicians,
                y=closed_tickets,
                marker_color=self.colors['success'],
                yaxis='y'
            ))
            
            fig.add_trace(go.Scatter(
                name='Avaliação Média',
                x=technicians,
                y=ratings,
                mode='lines+markers',
                marker=dict(color=self.colors['warning'], size=8),
                line=dict(color=self.colors['warning'], width=2),
                yaxis='y2'
            ))
            
            fig.update_layout(
                title='Performance dos Técnicos',
                xaxis_title='Técnicos',
                yaxis=dict(title='Quantidade de Tickets', side='left'),
                yaxis2=dict(title='Avaliação Média', side='right', overlaying='y', range=[0, 5]),
                barmode='group',
                height=400
            )
            
            return fig.to_json()
            
        except Exception as e:
            print(f"Erro ao gerar gráfico de performance: {e}")
            return None
    
    def get_device_type_distribution(self, date_from=None, date_to=None):
        """Distribuição por tipo de dispositivo"""
        try:
            # Definir período
            if not date_from:
                date_from = datetime.now() - timedelta(days=30)
            else:
                date_from = datetime.strptime(date_from, '%Y-%m-%d')
            
            if not date_to:
                date_to = datetime.now()
            else:
                date_to = datetime.strptime(date_to, '%Y-%m-%d')
            
            # Query
            query = db.session.query(
                Ticket.device_type,
                func.count(Ticket.id).label('count')
            ).filter(
                Ticket.created_at >= date_from,
                Ticket.created_at <= date_to
            ).group_by(Ticket.device_type).all()
            
            if not query:
                return None
            
            # Preparar dados
            device_types = []
            counts = []
            
            for device_type, count in query:
                device_types.append(device_type or 'Não especificado')
                counts.append(count)
            
            # Criar gráfico
            fig = go.Figure(data=[
                go.Bar(
                    x=device_types,
                    y=counts,
                    marker_color=self.colors['info'],
                    text=counts,
                    textposition='auto'
                )
            ])
            
            fig.update_layout(
                title='Distribuição por Tipo de Dispositivo',
                xaxis_title='Tipo de Dispositivo',
                yaxis_title='Quantidade',
                height=400
            )
            
            return fig.to_json()
            
        except Exception as e:
            print(f"Erro ao gerar gráfico de dispositivos: {e}")
            return None
    
    def get_revenue_chart(self, date_from=None, date_to=None):
        """Gráfico de receita ao longo do tempo"""
        try:
            # Definir período
            if not date_from:
                date_from = datetime.now() - timedelta(days=30)
            else:
                date_from = datetime.strptime(date_from, '%Y-%m-%d')
            
            if not date_to:
                date_to = datetime.now()
            else:
                date_to = datetime.strptime(date_to, '%Y-%m-%d')
            
            # Query para receita por dia
            query = db.session.query(
                func.date(Ticket.closed_at).label('date'),
                func.sum(Ticket.final_cost).label('revenue')
            ).filter(
                Ticket.closed_at >= date_from,
                Ticket.closed_at <= date_to,
                Ticket.status == 'closed',
                Ticket.final_cost.isnot(None)
            ).group_by(func.date(Ticket.closed_at)).all()
            
            if not query:
                return None
            
            # Preparar dados
            dates = []
            revenues = []
            
            for date, revenue in query:
                dates.append(date)
                revenues.append(float(revenue or 0))
            
            # Criar gráfico
            fig = go.Figure()
            
            fig.add_trace(go.Scatter(
                x=dates,
                y=revenues,
                mode='lines+markers',
                name='Receita Diária',
                line=dict(color=self.colors['success'], width=3),
                marker=dict(size=8),
                fill='tonexty'
            ))
            
            fig.update_layout(
                title='Receita ao Longo do Tempo',
                xaxis_title='Data',
                yaxis_title='Receita (R$)',
                hovermode='x unified',
                height=400
            )
            
            return fig.to_json()
            
        except Exception as e:
            print(f"Erro ao gerar gráfico de receita: {e}")
            return None
    
    def get_appointment_analytics(self, date_from=None, date_to=None):
        """Analytics de agendamentos"""
        try:
            # Definir período
            if not date_from:
                date_from = datetime.now() - timedelta(days=30)
            else:
                date_from = datetime.strptime(date_from, '%Y-%m-%d')
            
            if not date_to:
                date_to = datetime.now()
            else:
                date_to = datetime.strptime(date_to, '%Y-%m-%d')
            
            # Query para agendamentos por status
            status_query = db.session.query(
                Appointment.status,
                func.count(Appointment.id).label('count')
            ).filter(
                Appointment.created_at >= date_from,
                Appointment.created_at <= date_to
            ).group_by(Appointment.status).all()
            
            # Query para agendamentos por técnico
            technician_query = db.session.query(
                User.name,
                func.count(Appointment.id).label('count')
            ).join(
                Appointment, User.id == Appointment.technician_id
            ).filter(
                Appointment.created_at >= date_from,
                Appointment.created_at <= date_to
            ).group_by(User.id, User.name).all()
            
            return {
                'by_status': [{'status': status, 'count': count} for status, count in status_query],
                'by_technician': [{'technician': name, 'count': count} for name, count in technician_query]
            }
            
        except Exception as e:
            print(f"Erro ao gerar analytics de agendamentos: {e}")
            return {'error': str(e)}
    
    def generate_report(self, report_type, date_from=None, date_to=None, user_id=None, user_type=None):
        """Gerar relatório completo"""
        try:
            report_data = {
                'report_type': report_type,
                'generated_at': datetime.now().isoformat(),
                'period': {
                    'from': date_from,
                    'to': date_to
                },
                'user_filter': {
                    'user_id': user_id,
                    'user_type': user_type
                }
            }
            
            if report_type == 'dashboard':
                report_data['metrics'] = self.get_dashboard_metrics(date_from, date_to, user_id, user_type)
                report_data['charts'] = {
                    'tickets_by_status': self.get_tickets_by_status_chart(date_from, date_to, user_id, user_type),
                    'tickets_timeline': self.get_tickets_timeline_chart(date_from, date_to, user_id, user_type),
                    'device_distribution': self.get_device_type_distribution(date_from, date_to)
                }
                
                if not user_id:  # Relatório geral
                    report_data['charts']['technician_performance'] = self.get_technician_performance_chart(date_from, date_to)
                    report_data['charts']['revenue'] = self.get_revenue_chart(date_from, date_to)
            
            elif report_type == 'technician':
                if user_type != 'technician':
                    return {'error': 'Relatório de técnico requer user_type=technician'}
                
                report_data['metrics'] = self.get_dashboard_metrics(date_from, date_to, user_id, user_type)
                report_data['charts'] = {
                    'tickets_by_status': self.get_tickets_by_status_chart(date_from, date_to, user_id, user_type),
                    'tickets_timeline': self.get_tickets_timeline_chart(date_from, date_to, user_id, user_type)
                }
            
            elif report_type == 'financial':
                report_data['metrics'] = self.get_dashboard_metrics(date_from, date_to, user_id, user_type)
                report_data['charts'] = {
                    'revenue': self.get_revenue_chart(date_from, date_to)
                }
            
            elif report_type == 'appointments':
                report_data['analytics'] = self.get_appointment_analytics(date_from, date_to)
            
            return report_data
            
        except Exception as e:
            return {'error': str(e)}

# Instância global do serviço
analytics_service = AnalyticsService()

# Rotas da API
@analytics_bp.route('/analytics/dashboard', methods=['GET'])
def get_dashboard_analytics():
    """Obter analytics do dashboard"""
    try:
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        user_id = request.args.get('user_id')
        user_type = request.args.get('user_type')
        
        metrics = analytics_service.get_dashboard_metrics(date_from, date_to, user_id, user_type)
        
        return jsonify({
            'success': True,
            'metrics': metrics
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@analytics_bp.route('/analytics/charts/tickets-status', methods=['GET'])
def get_tickets_status_chart():
    """Gráfico de tickets por status"""
    try:
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        user_id = request.args.get('user_id')
        user_type = request.args.get('user_type')
        
        chart_data = analytics_service.get_tickets_by_status_chart(date_from, date_to, user_id, user_type)
        
        return jsonify({
            'success': True,
            'chart': chart_data
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@analytics_bp.route('/analytics/charts/tickets-timeline', methods=['GET'])
def get_tickets_timeline_chart():
    """Gráfico de timeline de tickets"""
    try:
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        user_id = request.args.get('user_id')
        user_type = request.args.get('user_type')
        
        chart_data = analytics_service.get_tickets_timeline_chart(date_from, date_to, user_id, user_type)
        
        return jsonify({
            'success': True,
            'chart': chart_data
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@analytics_bp.route('/analytics/charts/technician-performance', methods=['GET'])
def get_technician_performance_chart():
    """Gráfico de performance dos técnicos"""
    try:
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        
        chart_data = analytics_service.get_technician_performance_chart(date_from, date_to)
        
        return jsonify({
            'success': True,
            'chart': chart_data
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@analytics_bp.route('/analytics/charts/device-distribution', methods=['GET'])
def get_device_distribution_chart():
    """Gráfico de distribuição por tipo de dispositivo"""
    try:
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        
        chart_data = analytics_service.get_device_type_distribution(date_from, date_to)
        
        return jsonify({
            'success': True,
            'chart': chart_data
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@analytics_bp.route('/analytics/charts/revenue', methods=['GET'])
def get_revenue_chart():
    """Gráfico de receita"""
    try:
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        
        chart_data = analytics_service.get_revenue_chart(date_from, date_to)
        
        return jsonify({
            'success': True,
            'chart': chart_data
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@analytics_bp.route('/analytics/appointments', methods=['GET'])
def get_appointment_analytics():
    """Analytics de agendamentos"""
    try:
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        
        analytics_data = analytics_service.get_appointment_analytics(date_from, date_to)
        
        return jsonify({
            'success': True,
            'analytics': analytics_data
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@analytics_bp.route('/analytics/reports/<report_type>', methods=['GET'])
def generate_report(report_type):
    """Gerar relatório completo"""
    try:
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        user_id = request.args.get('user_id')
        user_type = request.args.get('user_type')
        
        report_data = analytics_service.generate_report(
            report_type, date_from, date_to, user_id, user_type
        )
        
        return jsonify({
            'success': True,
            'report': report_data
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@analytics_bp.route('/analytics/export/<report_type>', methods=['GET'])
def export_report(report_type):
    """Exportar relatório em formato JSON/CSV"""
    try:
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        user_id = request.args.get('user_id')
        user_type = request.args.get('user_type')
        export_format = request.args.get('format', 'json')
        
        report_data = analytics_service.generate_report(
            report_type, date_from, date_to, user_id, user_type
        )
        
        if export_format == 'csv':
            # Converter para CSV (simplificado)
            if 'metrics' in report_data:
                import csv
                import io
                
                output = io.StringIO()
                writer = csv.writer(output)
                
                # Cabeçalho
                writer.writerow(['Métrica', 'Valor'])
                
                # Dados das métricas
                metrics = report_data['metrics']
                for category, data in metrics.items():
                    if isinstance(data, dict):
                        for key, value in data.items():
                            writer.writerow([f"{category}_{key}", value])
                    else:
                        writer.writerow([category, data])
                
                csv_data = output.getvalue()
                output.close()
                
                return csv_data, 200, {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': f'attachment; filename=report_{report_type}_{datetime.now().strftime("%Y%m%d")}.csv'
                }
        
        return jsonify({
            'success': True,
            'report': report_data
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@analytics_bp.route('/analytics/kpis', methods=['GET'])
def get_kpis():
    """Obter KPIs principais"""
    try:
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        
        # Definir período
        if not date_from:
            date_from = datetime.now() - timedelta(days=30)
        else:
            date_from = datetime.strptime(date_from, '%Y-%m-%d')
        
        if not date_to:
            date_to = datetime.now()
        else:
            date_to = datetime.strptime(date_to, '%Y-%m-%d')
        
        # KPIs principais
        kpis = {
            'first_response_time': {
                'value': 2.5,  # horas
                'unit': 'horas',
                'trend': 'down',
                'change': -0.3
            },
            'resolution_rate': {
                'value': 87.5,
                'unit': '%',
                'trend': 'up',
                'change': 2.1
            },
            'customer_satisfaction': {
                'value': 4.2,
                'unit': '/5',
                'trend': 'up',
                'change': 0.1
            },
            'technician_utilization': {
                'value': 78.3,
                'unit': '%',
                'trend': 'stable',
                'change': 0.0
            },
            'revenue_per_ticket': {
                'value': 125.50,
                'unit': 'R$',
                'trend': 'up',
                'change': 8.25
            },
            'appointment_show_rate': {
                'value': 92.1,
                'unit': '%',
                'trend': 'up',
                'change': 1.5
            }
        }
        
        return jsonify({
            'success': True,
            'kpis': kpis,
            'period': {
                'from': date_from.isoformat(),
                'to': date_to.isoformat()
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

