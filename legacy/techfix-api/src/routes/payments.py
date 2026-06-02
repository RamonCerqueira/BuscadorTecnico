from flask import Blueprint, request, jsonify
import json
import os
import uuid
from datetime import datetime, timedelta
from src.models.user import db, User
from src.models.ticket import Ticket
from src.routes.notifications import notification_service

payments_bp = Blueprint('payments', __name__)

class PaymentService:
    def __init__(self):
        # Configurações dos gateways de pagamento
        # Em produção, essas configurações viriam de variáveis de ambiente
        self.stripe_secret_key = os.getenv('STRIPE_SECRET_KEY', 'sk_test_demo')
        self.stripe_public_key = os.getenv('STRIPE_PUBLIC_KEY', 'pk_test_demo')
        self.mercadopago_access_token = os.getenv('MERCADOPAGO_ACCESS_TOKEN', 'demo_token')
        
        # Configurações da plataforma
        self.platform_fee_percentage = 0.05  # 5% de comissão da plataforma
        self.currency = 'BRL'
        
        # Métodos de pagamento suportados
        self.payment_methods = {
            'credit_card': 'Cartão de Crédito',
            'debit_card': 'Cartão de Débito',
            'pix': 'PIX',
            'boleto': 'Boleto Bancário',
            'bank_transfer': 'Transferência Bancária'
        }
    
    def create_payment_intent(self, amount, currency='BRL', payment_method='credit_card', metadata=None):
        """Criar intenção de pagamento"""
        try:
            # Calcular taxas
            platform_fee = amount * self.platform_fee_percentage
            net_amount = amount - platform_fee
            
            payment_intent = {
                'id': f'pi_{uuid.uuid4().hex[:24]}',
                'amount': amount,
                'currency': currency,
                'payment_method': payment_method,
                'platform_fee': platform_fee,
                'net_amount': net_amount,
                'status': 'requires_payment_method',
                'created_at': datetime.utcnow(),
                'metadata': metadata or {}
            }
            
            # Para demonstração, simular diferentes gateways
            if payment_method == 'pix':
                payment_intent.update({
                    'pix_code': f'00020126580014BR.GOV.BCB.PIX0136{uuid.uuid4()}5204000053039865802BR5925TechFix Plataforma6009SAO PAULO62070503***6304{uuid.uuid4().hex[:4].upper()}',
                    'pix_qr_code': f'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
                    'expires_at': datetime.utcnow() + timedelta(minutes=30)
                })
            elif payment_method == 'boleto':
                payment_intent.update({
                    'boleto_url': f'https://demo.gateway.com/boleto/{payment_intent["id"]}',
                    'boleto_barcode': f'34191.79001 01043.510047 91020.150008 1 {(datetime.utcnow() + timedelta(days=3)).strftime("%Y%m%d")}{int(amount * 100):010d}',
                    'due_date': datetime.utcnow() + timedelta(days=3)
                })
            
            return {
                'success': True,
                'payment_intent': payment_intent
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def confirm_payment(self, payment_intent_id, payment_data):
        """Confirmar pagamento"""
        try:
            # Simular processamento do pagamento
            payment_result = {
                'id': f'ch_{uuid.uuid4().hex[:24]}',
                'payment_intent_id': payment_intent_id,
                'status': 'succeeded',
                'amount_received': payment_data.get('amount'),
                'payment_method': payment_data.get('payment_method'),
                'receipt_url': f'https://demo.gateway.com/receipt/{payment_intent_id}',
                'processed_at': datetime.utcnow()
            }
            
            # Para demonstração, simular diferentes resultados baseados no valor
            amount = payment_data.get('amount', 0)
            if amount < 10:
                payment_result['status'] = 'failed'
                payment_result['failure_reason'] = 'insufficient_funds'
            elif amount > 10000:
                payment_result['status'] = 'requires_action'
                payment_result['next_action'] = {
                    'type': '3d_secure',
                    'redirect_url': 'https://demo.gateway.com/3ds'
                }
            
            return {
                'success': True,
                'payment': payment_result
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def create_subscription(self, customer_id, plan_id, payment_method):
        """Criar assinatura recorrente"""
        try:
            subscription = {
                'id': f'sub_{uuid.uuid4().hex[:24]}',
                'customer_id': customer_id,
                'plan_id': plan_id,
                'status': 'active',
                'current_period_start': datetime.utcnow(),
                'current_period_end': datetime.utcnow() + timedelta(days=30),
                'payment_method': payment_method,
                'created_at': datetime.utcnow()
            }
            
            return {
                'success': True,
                'subscription': subscription
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def process_refund(self, payment_id, amount=None, reason=None):
        """Processar estorno"""
        try:
            refund = {
                'id': f'rf_{uuid.uuid4().hex[:24]}',
                'payment_id': payment_id,
                'amount': amount,
                'reason': reason or 'requested_by_customer',
                'status': 'succeeded',
                'created_at': datetime.utcnow()
            }
            
            return {
                'success': True,
                'refund': refund
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

# Modelo para armazenar transações
class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String(100), unique=True, nullable=False)  # ID do gateway
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id'), nullable=True)
    payer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    platform_fee = db.Column(db.Float, nullable=False)
    net_amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='BRL')
    payment_method = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), nullable=False)  # pending, completed, failed, refunded
    gateway = db.Column(db.String(50), nullable=False)  # stripe, mercadopago, etc.
    gateway_data = db.Column(db.Text)  # JSON com dados do gateway
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    ticket = db.relationship('Ticket', backref='transactions')
    payer = db.relationship('User', foreign_keys=[payer_id], backref='payments_made')
    receiver = db.relationship('User', foreign_keys=[receiver_id], backref='payments_received')
    
    def to_dict(self):
        return {
            'id': self.id,
            'externalId': self.external_id,
            'ticketId': self.ticket_id,
            'payerId': self.payer_id,
            'receiverId': self.receiver_id,
            'amount': self.amount,
            'platformFee': self.platform_fee,
            'netAmount': self.net_amount,
            'currency': self.currency,
            'paymentMethod': self.payment_method,
            'status': self.status,
            'gateway': self.gateway,
            'gatewayData': json.loads(self.gateway_data) if self.gateway_data else {},
            'description': self.description,
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat()
        }
    
    @staticmethod
    def from_dict(data):
        transaction = Transaction()
        transaction.external_id = data.get('externalId')
        transaction.ticket_id = data.get('ticketId')
        transaction.payer_id = data.get('payerId')
        transaction.receiver_id = data.get('receiverId')
        transaction.amount = data.get('amount')
        transaction.platform_fee = data.get('platformFee')
        transaction.net_amount = data.get('netAmount')
        transaction.currency = data.get('currency', 'BRL')
        transaction.payment_method = data.get('paymentMethod')
        transaction.status = data.get('status')
        transaction.gateway = data.get('gateway')
        transaction.gateway_data = json.dumps(data.get('gatewayData', {}))
        transaction.description = data.get('description')
        return transaction

# Instância global do serviço
payment_service = PaymentService()

# Rotas da API
@payments_bp.route('/payments/methods', methods=['GET'])
def get_payment_methods():
    """Listar métodos de pagamento disponíveis"""
    try:
        return jsonify({
            'success': True,
            'methods': payment_service.payment_methods
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@payments_bp.route('/payments/create-intent', methods=['POST'])
def create_payment_intent():
    """Criar intenção de pagamento"""
    try:
        data = request.get_json()
        
        amount = data.get('amount')
        payment_method = data.get('payment_method', 'credit_card')
        ticket_id = data.get('ticket_id')
        
        if not amount or amount <= 0:
            return jsonify({
                'success': False,
                'error': 'Valor inválido'
            }), 400
        
        # Verificar se o chamado existe
        if ticket_id:
            ticket = Ticket.query.get(ticket_id)
            if not ticket:
                return jsonify({
                    'success': False,
                    'error': 'Chamado não encontrado'
                }), 404
        
        metadata = {
            'ticket_id': ticket_id,
            'platform': 'techfix'
        }
        
        result = payment_service.create_payment_intent(
            amount=amount,
            payment_method=payment_method,
            metadata=metadata
        )
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@payments_bp.route('/payments/confirm', methods=['POST'])
def confirm_payment():
    """Confirmar pagamento"""
    try:
        data = request.get_json()
        
        payment_intent_id = data.get('payment_intent_id')
        payment_data = data.get('payment_data', {})
        
        if not payment_intent_id:
            return jsonify({
                'success': False,
                'error': 'ID da intenção de pagamento é obrigatório'
            }), 400
        
        result = payment_service.confirm_payment(payment_intent_id, payment_data)
        
        if result['success'] and result['payment']['status'] == 'succeeded':
            # Salvar transação no banco
            transaction_data = {
                'externalId': result['payment']['id'],
                'ticketId': payment_data.get('ticket_id'),
                'payerId': payment_data.get('payer_id'),
                'receiverId': payment_data.get('receiver_id'),
                'amount': payment_data.get('amount'),
                'platformFee': payment_data.get('amount', 0) * payment_service.platform_fee_percentage,
                'netAmount': payment_data.get('amount', 0) * (1 - payment_service.platform_fee_percentage),
                'paymentMethod': payment_data.get('payment_method'),
                'status': 'completed',
                'gateway': 'demo',
                'gatewayData': result['payment'],
                'description': f'Pagamento do chamado #{payment_data.get("ticket_id")}'
            }
            
            transaction = Transaction.from_dict(transaction_data)
            db.session.add(transaction)
            db.session.commit()
            
            # Enviar notificação
            if notification_service and payment_data.get('receiver_id'):
                notification_service.send_notification(
                    payment_data.get('receiver_id'),
                    {
                        'type': 'payment_received',
                        'title': 'Pagamento Recebido',
                        'message': f'Você recebeu um pagamento de R$ {payment_data.get("amount"):.2f}',
                        'data': {'transaction_id': transaction.id}
                    }
                )
        
        return jsonify(result)
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@payments_bp.route('/payments/transactions', methods=['GET'])
def get_transactions():
    """Listar transações do usuário"""
    try:
        user_id = request.args.get('user_id')
        transaction_type = request.args.get('type', 'all')  # all, sent, received
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'ID do usuário é obrigatório'
            }), 400
        
        query = Transaction.query
        
        if transaction_type == 'sent':
            query = query.filter_by(payer_id=user_id)
        elif transaction_type == 'received':
            query = query.filter_by(receiver_id=user_id)
        else:
            query = query.filter(
                (Transaction.payer_id == user_id) | 
                (Transaction.receiver_id == user_id)
            )
        
        transactions = query.order_by(Transaction.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'success': True,
            'transactions': [t.to_dict() for t in transactions.items],
            'pagination': {
                'page': page,
                'pages': transactions.pages,
                'per_page': per_page,
                'total': transactions.total
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@payments_bp.route('/payments/transactions/<int:transaction_id>', methods=['GET'])
def get_transaction(transaction_id):
    """Obter detalhes de uma transação"""
    try:
        transaction = Transaction.query.get_or_404(transaction_id)
        
        return jsonify({
            'success': True,
            'transaction': transaction.to_dict()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@payments_bp.route('/payments/refund', methods=['POST'])
def process_refund():
    """Processar estorno"""
    try:
        data = request.get_json()
        
        transaction_id = data.get('transaction_id')
        amount = data.get('amount')
        reason = data.get('reason')
        
        if not transaction_id:
            return jsonify({
                'success': False,
                'error': 'ID da transação é obrigatório'
            }), 400
        
        transaction = Transaction.query.get(transaction_id)
        if not transaction:
            return jsonify({
                'success': False,
                'error': 'Transação não encontrada'
            }), 404
        
        if transaction.status != 'completed':
            return jsonify({
                'success': False,
                'error': 'Transação não pode ser estornada'
            }), 400
        
        result = payment_service.process_refund(
            transaction.external_id,
            amount or transaction.amount,
            reason
        )
        
        if result['success']:
            # Atualizar status da transação
            transaction.status = 'refunded'
            transaction.updated_at = datetime.utcnow()
            db.session.commit()
            
            # Enviar notificações
            if notification_service:
                notification_service.send_notification(
                    transaction.payer_id,
                    {
                        'type': 'refund_processed',
                        'title': 'Estorno Processado',
                        'message': f'Seu estorno de R$ {amount or transaction.amount:.2f} foi processado',
                        'data': {'transaction_id': transaction.id}
                    }
                )
        
        return jsonify(result)
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@payments_bp.route('/payments/stats', methods=['GET'])
def get_payment_stats():
    """Estatísticas de pagamentos"""
    try:
        user_id = request.args.get('user_id')
        
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'ID do usuário é obrigatório'
            }), 400
        
        # Pagamentos enviados
        sent_total = db.session.query(db.func.sum(Transaction.amount)).filter_by(
            payer_id=user_id, status='completed'
        ).scalar() or 0
        
        sent_count = Transaction.query.filter_by(
            payer_id=user_id, status='completed'
        ).count()
        
        # Pagamentos recebidos
        received_total = db.session.query(db.func.sum(Transaction.net_amount)).filter_by(
            receiver_id=user_id, status='completed'
        ).scalar() or 0
        
        received_count = Transaction.query.filter_by(
            receiver_id=user_id, status='completed'
        ).count()
        
        # Comissões da plataforma (se for admin)
        platform_fees = db.session.query(db.func.sum(Transaction.platform_fee)).filter_by(
            status='completed'
        ).scalar() or 0
        
        return jsonify({
            'success': True,
            'stats': {
                'sent': {
                    'total': sent_total,
                    'count': sent_count
                },
                'received': {
                    'total': received_total,
                    'count': received_count
                },
                'platform_fees': platform_fees
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@payments_bp.route('/payments/webhook', methods=['POST'])
def payment_webhook():
    """Webhook para receber notificações dos gateways de pagamento"""
    try:
        data = request.get_json()
        
        # Processar webhook baseado no gateway
        gateway = request.headers.get('X-Gateway', 'unknown')
        
        if gateway == 'stripe':
            # Processar webhook do Stripe
            event_type = data.get('type')
            if event_type == 'payment_intent.succeeded':
                payment_intent = data.get('data', {}).get('object', {})
                # Atualizar status da transação
                pass
        elif gateway == 'mercadopago':
            # Processar webhook do Mercado Pago
            action = data.get('action')
            if action == 'payment.updated':
                payment_data = data.get('data', {})
                # Atualizar status da transação
                pass
        
        return jsonify({'status': 'success'})
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

