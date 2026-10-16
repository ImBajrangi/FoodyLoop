import React, { useState } from 'react';
import { 
  Boxes, 
  Scale, 
  AlertCircle, 
  Plus, 
  Minus,
  Layers,
  CheckCircle2,
  Utensils
} from 'lucide-react';
import { useAppState } from '../../services/useAppState';

export const RawMaterialPlanner: React.FC = () => {
  const { state, cache } = useAppState();
  const isHindi = state.language === 'hi';
  const [selectedRecipeId, setSelectedRecipeId] = useState(state.recipes[0].id);
  const [targetPortions, setTargetPortions] = useState<number>(100);

  const selectedRecipe = state.recipes.find(r => r.id === selectedRecipeId) || state.recipes[0];
  const maxPortionsPossible = cache.calculateMaxPortionsPossible(selectedRecipe.id);

  // Quick 1-tap stock adjustment helper
  const handleAdjustStock = (materialId: string, delta: number) => {
    const mat = state.rawMaterials.find(m => m.id === materialId);
    if (!mat) return;
    const newQty = Math.max(0, mat.quantity + delta);
    cache.updateRawMaterialStock(materialId, newQty);
  };

  return (
    <div className="glass-panel" style={{
      padding: '24px',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '2px solid #e5e5e5',
      borderBottom: '4px solid #d4d4d4',
      marginBottom: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px',
        borderBottom: '2px solid #f1f5f9',
        paddingBottom: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: '#fff4e5',
              border: '2px solid #ffc800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#c26900',
              boxShadow: '0 3px 0 #d97706'
            }}>
              <Boxes size={22} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
              {isHindi ? 'रसोई राशन व थाली क्षमता' : 'Pantry Stock & Dish Capacity'}
            </h3>
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
            {isHindi
              ? 'देखें दुकान में कितना मुख्य राशन उपलब्ध है और उससे कितनी ताजा थालियां बन सकती हैं।'
              : 'Monitor raw pantry stock and calculate the maximum fresh meals you can prepare.'}
          </p>
        </div>

        <div style={{
          backgroundColor: '#eff6ff',
          border: '2px solid #93c5fd',
          color: '#1d4ed8',
          padding: '8px 16px',
          borderRadius: '14px',
          fontSize: '0.86rem',
          fontWeight: 800,
          boxShadow: '0 3px 0 #60a5fa'
        }}>
          {isHindi ? 'अति-उत्पादन से 100% बचाव' : 'Waste-Free Kitchen Control'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Left Column: Raw Materials Inventory */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
              {isHindi ? 'रसोई का मुख्य कच्चा माल' : 'Pantry Stock (Krishna Bhojanalaya)'}
            </h4>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>
              {isHindi ? '1-टैप स्टॉक एडजस्ट' : '1-Tap Stock Update'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {state.rawMaterials.map(mat => {
              const isLow = mat.quantity <= mat.minThreshold;
              return (
                <div
                  key={mat.id}
                  style={{
                    background: isLow ? '#fff5f5' : '#ffffff',
                    padding: '14px 16px',
                    borderRadius: '14px',
                    border: isLow ? '2px solid #fca5a5' : '2px solid #e2e8f0',
                    borderBottom: isLow ? '4px solid #ef4444' : '4px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--color-text)' }}>
                        {mat.hindiName || mat.name}
                      </span>
                      {isLow ? (
                        <span className="badge badge-rose" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                          {isHindi ? 'स्टॉक कम' : 'Low Stock'}
                        </span>
                      ) : (
                        <span className="badge badge-emerald" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                          {isHindi ? 'पर्याप्त' : 'In Stock'}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      {mat.name} • ₹{mat.costPerUnit}/{mat.unit}
                    </div>
                  </div>

                  {/* Quantity & 1-Tap Quick Action Stepper */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: '#f8fafc',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '3px',
                    gap: '6px'
                  }}>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => handleAdjustStock(mat.id, -5)}
                      title={isHindi ? '5 घटाएं' : 'Minus 5'}
                      style={{
                        minWidth: '34px',
                        width: '34px',
                        minHeight: '34px',
                        height: '34px',
                        padding: 0,
                        margin: 0,
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        borderBottom: '3px solid #94a3b8',
                        backgroundColor: '#ffffff',
                        color: '#334155',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        fontWeight: 900
                      }}
                    >
                      <Minus size={16} strokeWidth={3} />
                    </button>

                    <div style={{ minWidth: '60px', textAlign: 'center' }}>
                      <span style={{
                        fontWeight: 900,
                        fontSize: '1.2rem',
                        color: isLow ? '#dc2626' : '#1e293b'
                      }}>
                        {mat.quantity}
                      </span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-text-muted)', marginLeft: '3px' }}>
                        {mat.unit}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => handleAdjustStock(mat.id, 5)}
                      title={isHindi ? '5 जोड़ें' : 'Add 5'}
                      style={{
                        minWidth: '34px',
                        width: '34px',
                        minHeight: '34px',
                        height: '34px',
                        padding: 0,
                        margin: 0,
                        borderRadius: '8px',
                        border: '1.5px solid #79cc33',
                        borderBottom: '3px solid #58a700',
                        backgroundColor: '#a5ed6e',
                        color: '#111111',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        fontWeight: 900
                      }}
                    >
                      <Plus size={16} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Recipe Mapping & Maximum Portions Calculator */}
        <div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--color-text)', display: 'block', marginBottom: '8px' }}>
              {isHindi ? 'व्यंजन चुनें (Select Dish to Plan):' : 'Select Dish to Inspect Recipe Capacity:'}
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {state.recipes.map(r => {
                const isSelected = r.id === selectedRecipeId;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRecipeId(r.id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      backgroundColor: isSelected ? '#58cc02' : '#ffffff',
                      color: isSelected ? '#ffffff' : 'var(--color-text)',
                      border: isSelected ? '2px solid #58cc02' : '2px solid #e2e8f0',
                      borderBottom: isSelected ? '4px solid #58a700' : '4px solid #cbd5e1',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {r.itemName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recipe Breakdown & Servings Card */}
          <div style={{
            background: 'var(--color-background)',
            border: '2px solid #e2e8f0',
            padding: '18px',
            borderRadius: '16px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Scale size={18} color="#c26900" />
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text)' }}>
                  {isHindi ? `प्रति ${selectedRecipe.portionUnit} सामग्री:` : `Ingredients per ${selectedRecipe.portionUnit}:`}
                </span>
              </div>

              <span className="badge badge-neutral" style={{ fontSize: '0.74rem' }}>
                {selectedRecipe.ingredients.length} {isHindi ? 'घटक' : 'ingredients'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem', marginBottom: '16px' }}>
              {selectedRecipe.ingredients.map(ing => (
                <div key={ing.rawMaterialId} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #d4e7f0', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--color-text)', fontWeight: 700 }}>{ing.name}</span>
                  <span style={{ fontWeight: 800, color: '#1e293b' }}>
                    {Math.round(ing.quantityPerPortion * 1000)} {ing.unit === 'kg' ? 'ग्राम (g)' : 'मिली (ml)'}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculated Max Servings Banner */}
            <div style={{
              background: '#ffffff',
              border: '2px solid #58cc02',
              borderBottom: '4px solid #58a700',
              padding: '16px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 800, textTransform: 'uppercase' }}>
                  {isHindi ? 'वर्तमान राशन से अधिकतम थालियां:' : 'Max Portions Possible from Pantry:'}
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#15803d', margin: '2px 0' }}>
                  {maxPortionsPossible} <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{selectedRecipe.portionUnit}s</span>
                </div>
              </div>

              <div style={{
                backgroundColor: '#e8fcd9',
                border: '1.5px solid #a5ed6e',
                color: '#388e00',
                padding: '6px 14px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <CheckCircle2 size={16} />
                <span>{isHindi ? 'ताजा व सुरक्षित' : 'Guaranteed Fresh'}</span>
              </div>
            </div>
          </div>

          {/* Interactive Batch Plan Checker */}
          <div style={{
            background: '#ffffff',
            border: '2px solid #e2e8f0',
            borderBottom: '4px solid #cbd5e1',
            borderRadius: '14px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text)' }}>
                {isHindi ? 'कल कितनी थालियां बनाने का विचार है?' : 'Planning tomorrow batch size?'}
              </span>
              <span style={{ fontWeight: 900, color: '#1d4ed8', fontSize: '1rem' }}>
                {targetPortions} {isHindi ? 'थाली' : 'plates'}
              </span>
            </div>

            <input
              type="range"
              min={20}
              max={250}
              step={10}
              value={targetPortions}
              onChange={(e) => setTargetPortions(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#1cb0f6',
                cursor: 'pointer',
                marginBottom: '10px'
              }}
            />

            <div style={{
              backgroundColor: targetPortions <= maxPortionsPossible ? '#f0fdf4' : '#fff5f5',
              border: targetPortions <= maxPortionsPossible ? '1.5px solid #86efac' : '1.5px solid #fca5a5',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '0.82rem',
              color: targetPortions <= maxPortionsPossible ? '#15803d' : '#dc2626',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {targetPortions <= maxPortionsPossible ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>
                    {isHindi
                      ? `पर्याप्त राशन उपलब्ध है! ${targetPortions} थालियां आसानी से बन जाएंगी।`
                      : `Sufficient pantry stock available for ${targetPortions} portions!`}
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle size={18} />
                  <span>
                    {isHindi
                      ? `चेतावनी: राशन कम पड़ सकता है! अधिकतम ${maxPortionsPossible} थालियां ही बन सकती हैं।`
                      : `Alert: Insufficient stock. You can prepare at most ${maxPortionsPossible} portions.`}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
