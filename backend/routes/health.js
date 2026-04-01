const express = require('express');
const router = express.Router();

// Health conditions reference
router.get('/conditions', (req, res) => {
  res.json({
    success: true,
    data: {
      conditions: [
        { value: 'asthma', label: 'Asthma', description: 'Chronic respiratory condition' },
        { value: 'allergies', label: 'Allergies', description: 'Environmental allergies' },
        { value: 'heart_disease', label: 'Heart Disease', description: 'Cardiovascular conditions' },
        { value: 'respiratory_issues', label: 'Respiratory Issues', description: 'General breathing problems' },
        { value: 'diabetes', label: 'Diabetes', description: 'Blood sugar regulation issues' },
        { value: 'hypertension', label: 'Hypertension', description: 'High blood pressure' },
        { value: 'none', label: 'None', description: 'No pre-existing conditions' }
      ],
      smokingStatuses: [
        { value: 'non-smoker', label: 'Non-Smoker' },
        { value: 'smoker', label: 'Smoker' },
        { value: 'ex-smoker', label: 'Ex-Smoker' }
      ]

      
    }
  });
});

module.exports = router;
