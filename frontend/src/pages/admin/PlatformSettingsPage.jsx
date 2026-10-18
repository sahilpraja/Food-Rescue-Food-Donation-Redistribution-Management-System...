import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sliders, Save, RotateCcw } from 'lucide-react';

export default function PlatformSettingsPage() {
  const { settings, updateSettings, showToast } = useApp();

  const [formData, setFormData] = useState({
    defaultDiscoveryRadiusKm: settings.defaultDiscoveryRadiusKm || 10,
    claimAcceptTimeoutMinutes: settings.claimAcceptTimeoutMinutes || 10,
    volunteerAssignmentWaitMinutes: settings.volunteerAssignmentWaitMinutes || 15,
    mealWeightGrams: settings.mealWeightGrams || 350,
    co2ePerKgSaved: settings.co2ePerKgSaved || 2.5,
    otpExpiryMinutes: settings.otpExpiryMinutes || 10,
    maxOtpAttempts: settings.maxOtpAttempts || 5
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings(formData);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem 1.25rem 4rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
          Configurable Parameters
        </span>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '2px' }}>
          Platform System Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Adjust operational thresholds, timeout policies, and calculation models (Brain.md Section 11).
        </p>
      </div>

      <form onSubmit={handleSave} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Default NGO Discovery Radius (km)</label>
            <input
              type="number"
              name="defaultDiscoveryRadiusKm"
              className="form-input"
              value={formData.defaultDiscoveryRadiusKm}
              onChange={handleChange}
              min="1"
              max="50"
            />
            <span className="form-hint">Default radius applied on first discover page load (Brain.md default: 10 km).</span>
          </div>

          <div className="form-group">
            <label className="form-label">Claim Accept Timeout (minutes)</label>
            <input
              type="number"
              name="claimAcceptTimeoutMinutes"
              className="form-input"
              value={formData.claimAcceptTimeoutMinutes}
              onChange={handleChange}
              min="2"
              max="60"
            />
            <span className="form-hint">Donor decision window before claim auto-accepts to prevent food spoilage (D5 default: 10 min).</span>
          </div>

          <div className="form-group">
            <label className="form-label">Volunteer Assignment Wait Time (minutes)</label>
            <input
              type="number"
              name="volunteerAssignmentWaitMinutes"
              className="form-input"
              value={formData.volunteerAssignmentWaitMinutes}
              onChange={handleChange}
              min="5"
              max="60"
            />
            <span className="form-hint">Duration before prompting NGO to switch to self-pickup if courier isn't found.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Standard Meal Weight (grams)</label>
            <input
              type="number"
              name="mealWeightGrams"
              className="form-input"
              value={formData.mealWeightGrams}
              onChange={handleChange}
              min="100"
              max="1000"
            />
            <span className="form-hint">Weight conversion benchmark per meal (BR-08 default: 350 g).</span>
          </div>

          <div className="form-group">
            <label className="form-label">CO₂e Avoided Factor (kg CO₂e per kg food)</label>
            <input
              type="number"
              step="0.1"
              name="co2ePerKgSaved"
              className="form-input"
              value={formData.co2ePerKgSaved}
              onChange={handleChange}
              min="0.5"
              max="10"
            />
            <span className="form-hint">Scientific benchmark estimate for avoided emissions (BR-09 default: 2.5 kg).</span>
          </div>

          <div className="form-group">
            <label className="form-label">Max Handover OTP Attempts</label>
            <input
              type="number"
              name="maxOtpAttempts"
              className="form-input"
              value={formData.maxOtpAttempts}
              onChange={handleChange}
              min="3"
              max="10"
            />
            <span className="form-hint">Number of incorrect OTP attempts permitted before lockout (default: 5 tries).</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <button type="submit" className="btn btn-primary" style={{ gap: '6px' }}>
            <Save size={16} />
            <span>Save Platform Parameters</span>
          </button>
        </div>
      </form>
    </div>
  );
}
