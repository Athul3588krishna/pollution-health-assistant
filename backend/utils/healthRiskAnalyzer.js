class HealthRiskAnalyzer {
  // Calculate base risk score from AQI
  calculateBaseRisk(aqi) {
    // AQI Scale: 1 (Good) to 5 (Very Poor)
    const aqiRiskMap = {
      1: 10,  // Good
      2: 30,  // Fair
      3: 50,  // Moderate
      4: 75,  // Poor
      5: 95   // Very Poor
    };
    return aqiRiskMap[aqi] || 50;
  }

  // Adjust risk based on health conditions
  adjustForHealthConditions(baseRisk, conditions) {
    let adjustment = 0;

    if (conditions.includes('asthma')) {
      adjustment += 15;
    }
    if (conditions.includes('respiratory_issues')) {
      adjustment += 12;
    }
    if (conditions.includes('heart_disease')) {
      adjustment += 10;
    }
    if (conditions.includes('allergies')) {
      adjustment += 8;
    }
    if (conditions.includes('hypertension')) {
      adjustment += 5;
    }

    return Math.min(baseRisk + adjustment, 100);
  }

  // Adjust risk based on age
  adjustForAge(risk, age) {
    if (age < 12 || age > 65) {
      return Math.min(risk + 10, 100);
    }
    return risk;
  }

  // Adjust risk based on smoking status
  adjustForSmoking(risk, smokingStatus) {
    if (smokingStatus === 'smoker') {
      return Math.min(risk + 8, 100);
    }
    if (smokingStatus === 'ex-smoker') {
      return Math.min(risk + 3, 100);
    }
    return risk;
  }

  // Adjust risk based on weather conditions
  adjustForWeather(risk, weather) {
    let adjustment = 0;

    // High humidity can worsen respiratory issues
    if (weather.humidity > 80) {
      adjustment += 5;
    }

    // Extreme temperatures
    if (weather.temperature > 35 || weather.temperature < 5) {
      adjustment += 5;
    }

    return Math.min(risk + adjustment, 100);
  }

  // Get risk level from score
  getRiskLevel(score) {
    if (score <= 20) return 'Low';
    if (score <= 40) return 'Moderate';
    if (score <= 60) return 'High';
    if (score <= 80) return 'Very High';
    return 'Severe';
  }

  // Generate recommendations based on risk
  generateRecommendations(riskLevel, aqi, conditions) {
    const recommendations = [];

    if (riskLevel === 'Low') {
      recommendations.push('Air quality is good. Safe for outdoor activities.');
      recommendations.push('Maintain regular exercise routine.');
    } else if (riskLevel === 'Moderate') {
      recommendations.push('Air quality is acceptable for most people.');
      recommendations.push('Sensitive individuals should limit prolonged outdoor activities.');
      if (conditions.includes('asthma') || conditions.includes('respiratory_issues')) {
        recommendations.push('Keep your inhaler handy if you have asthma.');
      }
    } else if (riskLevel === 'High') {
      recommendations.push('Reduce prolonged outdoor activities, especially for sensitive groups.');
      recommendations.push('Wear a mask (N95 or better) when going outside.');
      recommendations.push('Keep windows closed and use air purifiers indoors.');
      if (conditions.includes('asthma')) {
        recommendations.push('Monitor your breathing closely and have rescue medication available.');
      }
    } else if (riskLevel === 'Very High') {
      recommendations.push('Avoid outdoor activities if possible.');
      recommendations.push('Mandatory mask use (N95 or N99) if going outside.');
      recommendations.push('Stay indoors with air purifiers running.');
      recommendations.push('Monitor health symptoms continuously.');
      if (conditions.includes('heart_disease')) {
        recommendations.push('Monitor heart rate and any chest discomfort.');
      }
    } else if (riskLevel === 'Severe') {
      recommendations.push('⚠️ STAY INDOORS - Do not go outside unless absolutely necessary.');
      recommendations.push('Keep all windows and doors closed.');
      recommendations.push('Use high-quality air purifiers.');
      recommendations.push('Monitor health symptoms very closely.');
      recommendations.push('Have emergency contacts ready.');
    }

    return recommendations;
  }

  // Generate warnings
  generateWarnings(riskLevel, conditions) {
    const warnings = [];

    if (riskLevel === 'High' || riskLevel === 'Very High' || riskLevel === 'Severe') {
      warnings.push('⚠️ Health Alert: Poor air quality detected!');
      
      if (conditions.length > 0) {
        warnings.push('⚠️ Your existing health conditions increase your risk. Exercise extreme caution.');
      }

      if (riskLevel === 'Very High' || riskLevel === 'Severe') {
        warnings.push('⚠️ MEDICAL CONSULTATION ADVISED: If you experience breathing difficulties, chest pain, or unusual symptoms, seek medical attention immediately.');
      }
    }

    return warnings;
  }

  // Suggest medicine categories (generic)
  suggestMedicines(conditions, riskLevel) {
    const medicines = [];

    if (riskLevel === 'High' || riskLevel === 'Very High' || riskLevel === 'Severe') {
      if (conditions.includes('asthma') || conditions.includes('respiratory_issues')) {
        medicines.push('Bronchodilators (e.g., Salbutamol) - Consult doctor');
        medicines.push('Anti-inflammatory inhalers - Consult doctor');
      }

      if (conditions.includes('allergies')) {
        medicines.push('Antihistamines (e.g., Cetirizine) - Over-the-counter');
        medicines.push('Nasal decongestants - Consult pharmacist');
      }

      medicines.push('Vitamin C supplements - Boost immunity');
      medicines.push('Antioxidants - Support respiratory health');
      
      medicines.push('');
      medicines.push('⚠️ DISCLAIMER: These are general suggestions. Always consult a healthcare professional before taking any medication.');
    }

    return medicines;
  }

  // Main analysis function
  analyzeHealthRisk(pollutionData, weatherData, userProfile) {
    // Calculate base risk
    let riskScore = this.calculateBaseRisk(pollutionData.aqi);

    // Apply adjustments
    riskScore = this.adjustForHealthConditions(riskScore, userProfile.healthConditions || []);
    riskScore = this.adjustForAge(riskScore, userProfile.age);
    riskScore = this.adjustForSmoking(riskScore, userProfile.smokingStatus);
    riskScore = this.adjustForWeather(riskScore, weatherData);

    // Get risk level
    const riskLevel = this.getRiskLevel(riskScore);

    // Generate recommendations, warnings, and medicines
    const recommendations = this.generateRecommendations(
      riskLevel, 
      pollutionData.aqi, 
      userProfile.healthConditions || []
    );
    const warnings = this.generateWarnings(riskLevel, userProfile.healthConditions || []);
    const suggestedMedicines = this.suggestMedicines(userProfile.healthConditions || [], riskLevel);

    return {
      level: riskLevel,
      score: Math.round(riskScore),
      recommendations,
      warnings,
      suggestedMedicines
    };
  }
}

module.exports = new HealthRiskAnalyzer();
