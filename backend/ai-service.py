from flask import Flask, request, jsonify
import json

app = Flask(__name__)
PORT = 5000

# Mock AI quality detection
@app.route('/vision/grade', methods=['POST'])
def grade_crop():
    """Grade crop quality from image"""
    data = request.json
    image_path = data.get('imagePath')
    
    # Mock: return Grade A/B/C with confidence
    grades = ['A', 'B', 'C']
    confidence = 94.5
    
    return jsonify({
        'success': True,
        'grade': 'A',
        'confidence': confidence,
        'defects': 0,
        'quality_score': 94.5
    })

# Mock fraud detection
@app.route('/fraud/analyze', methods=['POST'])
def analyze_fraud():
    """Analyze transaction for fraud"""
    data = request.json
    
    offer_price = data.get('offerPrice', 0)
    mandi_price = data.get('mandiPrice', 0)
    
    # Simple rule: < 85% of mandi price is suspicious
    ratio = (offer_price / mandi_price * 100) if mandi_price > 0 else 100
    is_fraud = ratio < 85
    
    return jsonify({
        'success': True,
        'isFraud': is_fraud,
        'fraudScore': 85 if is_fraud else 15,
        'ratio': ratio,
        'recommendation': 'block' if is_fraud else 'accept'
    })

# Text to speech (mock)
@app.route('/tts/generate', methods=['POST'])
def generate_speech():
    """Generate speech from text"""
    data = request.json
    text = data.get('text', '')
    language = data.get('language', 'hi-IN')
    
    return jsonify({
        'success': True,
        'audioUrl': f'/audio/tts-{hash(text)}.mp3',
        'language': language,
        'textLength': len(text),
        'estimatedDuration': len(text) / 10
    })

if __name__ == '__main__':
    print(f'✅ AI Service running on port {PORT}')
    app.run(host='0.0.0.0', port=PORT, debug=True)
