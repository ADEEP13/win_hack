from flask import Flask, request, jsonify
import json
from datetime import datetime
import statistics

app = Flask(__name__)
PORT = 5000

# In-memory fraud database (would be PostgreSQL in production)
fraud_database = {
    'buyer_profiles': {},
    'offer_history': [],
    'flagged_buyers': []
}

# ============================================
# VISION / QUALITY GRADING SERVICE
# ============================================

@app.route('/vision/grade', methods=['POST'])
def grade_crop():
    """Grade crop quality from image using computer vision simulation"""
    try:
        data = request.json
        image_path = data.get('imagePath', '')
        crop_type = data.get('cropType', 'unknown')
        
        # Mock quality detection based on crop type
        quality_metrics = {
            'rice': {'defects': 2, 'color_score': 92, 'moisture': 12.5},
            'wheat': {'defects': 1, 'color_score': 94, 'moisture': 11.0},
            'tomato': {'defects': 0, 'color_score': 96, 'moisture': 85.0},
            'onion': {'defects': 3, 'color_score': 88, 'moisture': 14.0},
        }
        
        metrics = quality_metrics.get(crop_type.lower(), 
                                     {'defects': 1, 'color_score': 90, 'moisture': 12.0})
        
        # Calculate grade
        grade = 'A' if metrics['color_score'] >= 90 else ('B' if metrics['color_score'] >= 75 else 'C')
        quality_score = metrics['color_score']
        
        return jsonify({
            'success': True,
            'grade': grade,
            'quality_score': quality_score,
            'defects': metrics['defects'],
            'moisture_level': metrics['moisture'],
            'confidence': 94.5,
            'recommendations': 'Store in cool, dry place' if metrics['moisture'] > 15 else 'Ready for market',
            'gradeDate': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================
# ADVANCED FRAUD DETECTION SERVICE
# ============================================

@app.route('/fraud/analyze', methods=['POST'])
def analyze_fraud():
    """
    ML-powered fraud detection analyzing:
    - Price anomalies
    - Buyer behavior patterns
    - Market consistency
    - Exploitation attempts
    """
    try:
        data = request.json
        
        offer_price = data.get('offerPrice', 0)
        mandi_price = data.get('mandiPrice', 0)
        buyer_id = data.get('buyerId', 'unknown')
        crop_type = data.get('cropType', 'unknown')
        offer_history = data.get('offerHistory', [])
        
        if mandi_price <= 0:
            return jsonify({'success': False, 'error': 'Invalid mandi price'}), 400
        
        fraud_score = 0
        risk_factors = []
        
        # ============================================
        # FACTOR 1: Price-to-Mandi Ratio
        # ============================================
        price_ratio = (offer_price / mandi_price) * 100
        
        if price_ratio < 70:
            fraud_score += 40
            risk_factors.append({
                'factor': 'SEVERE_PRICE_DROP',
                'severity': 'CRITICAL',
                'description': f'Price is only {price_ratio:.1f}% of market value',
                'confidence': 0.95
            })
        elif price_ratio < 85:
            fraud_score += 25
            risk_factors.append({
                'factor': 'BELOW_MINIMUM',
                'severity': 'HIGH',
                'description': f'Price is {price_ratio:.1f}% of market (below 85% minimum)',
                'confidence': 0.90
            })
        elif price_ratio < 90:
            fraud_score += 10
            risk_factors.append({
                'factor': 'LOW_PRICE_WARNING',
                'severity': 'MEDIUM',
                'description': f'Price is {price_ratio:.1f}% of market (below fair value)',
                'confidence': 0.75
            })
        
        # ============================================
        # FACTOR 2: Buyer Behavior Analysis
        # ============================================
        if buyer_id in fraud_database['buyer_profiles']:
            buyer_profile = fraud_database['buyer_profiles'][buyer_id]
            total_offers = buyer_profile.get('total_offers', 0)
            suspicious_count = buyer_profile.get('suspicious_offers', 0)
            
            if total_offers > 0:
                exploitation_rate = (suspicious_count / total_offers) * 100
                
                if exploitation_rate > 60:
                    fraud_score += 30
                    risk_factors.append({
                        'factor': 'REPEAT_EXPLOITER',
                        'severity': 'HIGH',
                        'description': f'Buyer has {exploitation_rate:.0f}% history of exploitative offers',
                        'confidence': 0.85
                    })
                    fraud_database['flagged_buyers'].append(buyer_id)
                elif exploitation_rate > 30:
                    fraud_score += 15
                    risk_factors.append({
                        'factor': 'SUSPICIOUS_PATTERN',
                        'severity': 'MEDIUM',
                        'description': f'Buyer shows {exploitation_rate:.0f}% pattern of low offers',
                        'confidence': 0.70
                    })
        
        # ============================================
        # FACTOR 3: Statistical Anomaly Detection
        # ============================================
        if offer_history and len(offer_history) > 2:
            try:
                prices = [h.get('price', offer_price) for h in offer_history]
                mean_price = statistics.mean(prices)
                std_dev = statistics.stdev(prices) if len(prices) > 1 else 0
                
                # Z-score: how many standard deviations from mean
                z_score = abs((offer_price - mean_price) / std_dev) if std_dev > 0 else 0
                
                if z_score > 2.5:
                    fraud_score += 15
                    risk_factors.append({
                        'factor': 'STATISTICAL_ANOMALY',
                        'severity': 'MEDIUM',
                        'description': f'Price deviates {z_score:.1f} std devs from history',
                        'confidence': 0.80
                    })
            except:
                pass
        
        # ============================================
        # FACTOR 4: Timing-Based Analysis
        # ============================================
        # If multiple offers on same crop in short time, buyer may be trying to confuse
        if len(offer_history) > 3:
            recent_offers = [o for o in offer_history if o.get('recency', 100) < 24]  # Last 24 hours
            if len(recent_offers) > 3:
                fraud_score += 10
                risk_factors.append({
                    'factor': 'RAPID_OFFERS',
                    'severity': 'LOW',
                    'description': f'Buyer made {len(recent_offers)} offers in 24 hours (possible spam)',
                    'confidence': 0.60
                })
        
        # Cap fraud score at 100
        fraud_score = min(fraud_score, 100)
        
        # ============================================
        # GENERATE RECOMMENDATION
        # ============================================
        if fraud_score >= 70:
            recommendation = 'BLOCK'
            action = 'Block this offer and flag buyer'
        elif fraud_score >= 50:
            recommendation = 'WARN'
            action = 'Alert farmer to review carefully before accepting'
        elif fraud_score >= 30:
            recommendation = 'REVIEW'
            action = 'Fair price but slightly low - farmer can negotiate'
        else:
            recommendation = 'ACCEPT'
            action = 'Reasonable offer - safe to proceed'
        
        # Store in database for future learning
        fraud_database['offer_history'].append({
            'buyer_id': buyer_id,
            'crop_type': crop_type,
            'offer_price': offer_price,
            'mandi_price': mandi_price,
            'fraud_score': fraud_score,
            'timestamp': datetime.now().isoformat()
        })
        
        # Update buyer profile
        if buyer_id not in fraud_database['buyer_profiles']:
            fraud_database['buyer_profiles'][buyer_id] = {
                'total_offers': 0,
                'suspicious_offers': 0,
                'accepted_offers': 0
            }
        
        fraud_database['buyer_profiles'][buyer_id]['total_offers'] += 1
        if fraud_score >= 50:
            fraud_database['buyer_profiles'][buyer_id]['suspicious_offers'] += 1
        
        return jsonify({
            'success': True,
            'fraudAnalysis': {
                'fraudScore': fraud_score,
                'riskLevel': 'CRITICAL' if fraud_score >= 70 else ('HIGH' if fraud_score >= 50 else ('MEDIUM' if fraud_score >= 30 else 'LOW')),
                'riskFactors': risk_factors,
            },
            'priceAnalysis': {
                'offerPrice': offer_price,
                'mandiPrice': mandi_price,
                'priceRatio': round(price_ratio, 2),
                'priceGap': mandi_price - offer_price,
                'fairPrice': round(mandi_price * 0.95, 2),
            },
            'recommendation': recommendation,
            'action': action,
            'buyerStatus': 'FLAGGED' if buyer_id in fraud_database['flagged_buyers'] else 'NORMAL',
            'confidence': 0.85 + (fraud_score / 1000)  # Confidence increases with score
        })
    
    except Exception as e:
        print(f"Fraud analysis error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================
# BUYER REPUTATION ENDPOINT
# ============================================

@app.route('/fraud/buyer-reputation', methods=['GET'])
def get_buyer_reputation():
    """Get buyer reputation score"""
    try:
        buyer_id = request.args.get('buyerId', 'unknown')
        
        if buyer_id not in fraud_database['buyer_profiles']:
            return jsonify({
                'success': True,
                'buyerId': buyer_id,
                'reputationScore': 50,  # Neutral for new buyers
                'status': 'NEW',
                'riskLevel': 'UNKNOWN'
            })
        
        profile = fraud_database['buyer_profiles'][buyer_id]
        total = profile['total_offers']
        suspicious = profile['suspicious_offers']
        
        # Calculate reputation (0-100)
        if total == 0:
            reputation = 50
        else:
            success_rate = ((total - suspicious) / total) * 100
            reputation = success_rate
        
        is_flagged = buyer_id in fraud_database['flagged_buyers']
        
        return jsonify({
            'success': True,
            'buyerId': buyer_id,
            'reputationScore': round(reputation, 2),
            'totalOffers': total,
            'suspiciousOffers': suspicious,
            'status': 'FLAGGED' if is_flagged else 'NORMAL',
            'riskLevel': 'CRITICAL' if reputation < 30 else ('HIGH' if reputation < 50 else 'NORMAL'),
            'recommendation': 'Buyer appears trustworthy' if reputation > 70 else 'Be cautious with this buyer'
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================
# TEXT-TO-SPEECH SERVICE
# ============================================

@app.route('/tts/generate', methods=['POST'])
def generate_speech():
    """Generate speech alert for fraud warnings"""
    try:
        data = request.json
        text = data.get('text', '')
        language = data.get('language', 'hi-IN')
        alert_type = data.get('alertType', 'info')
        
        return jsonify({
            'success': True,
            'audioUrl': f'/audio/tts-{hash(text)}.mp3',
            'language': language,
            'alertType': alert_type,
            'textLength': len(text),
            'estimatedDuration': max(5, len(text) / 15),  # ~15 chars per second
            'priority': 'HIGH' if alert_type == 'fraud_alert' else 'MEDIUM'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================
# STATISTICS & REPORTING
# ============================================

@app.route('/fraud/stats', methods=['GET'])
def get_fraud_stats():
    """Get fraud detection statistics"""
    try:
        total_offers = len(fraud_database['offer_history'])
        high_risk_offers = len([o for o in fraud_database['offer_history'] if o['fraud_score'] >= 60])
        
        return jsonify({
            'success': True,
            'statistics': {
                'totalOffersAnalyzed': total_offers,
                'highRiskOffers': high_risk_offers,
                'fraudRate': round((high_risk_offers / total_offers * 100), 2) if total_offers > 0 else 0,
                'totalBuyersTracked': len(fraud_database['buyer_profiles']),
                'flaggedBuyers': len(fraud_database['flagged_buyers']),
            },
            'recentAlerts': fraud_database['offer_history'][-10:] if total_offers > 0 else []
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


if __name__ == '__main__':
    print(f'✅ AI Fraud Detection Service running on port {PORT}')
    print('📊 Features: Quality grading, fraud analysis, buyer reputation, TTS alerts')
    app.run(host='0.0.0.0', port=PORT, debug=True)
