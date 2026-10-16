import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  UtensilsCrossed, 
  Flame, 
  Clock, 
  ShieldCheck, 
  CheckCircle, 
  Sparkles, 
  Search,
  Zap,
  X
} from 'lucide-react';
import { useAppState } from '../../services/useAppState';
import type { RestaurantCustomItem, StorageCondition } from '../../types';

interface RestaurantItemsManagerProps {
  onQuickDonateSurplus?: (item: RestaurantCustomItem) => void;
}

export const RestaurantItemsManager: React.FC<RestaurantItemsManagerProps> = ({
  onQuickDonateSurplus
}) => {
  const { state, cache } = useAppState();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Form State
  const [name, setName] = useState('');
  const [hindiName, setHindiName] = useState('');
  const [category, setCategory] = useState<RestaurantCustomItem['category']>('Cooked Meals');
  const [portionUnit, setPortionUnit] = useState('Plates');
  const [defaultQuantity, setDefaultQuantity] = useState(80);
  const [storageCondition, setStorageCondition] = useState<StorageCondition>('hot_held');
  const [shelfLifeHours, setShelfLifeHours] = useState(4);
  const [preparationTemperature, setPreparationTemperature] = useState(68);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const items = state.restaurantItems || [];

  const categories = ['All', 'Cooked Meals', 'Snacks / Sweets', 'Breads / Roti', 'Rice & Lentils'];

  const filteredItems = items.filter((item: RestaurantCustomItem) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.hindiName.includes(searchQuery);
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    cache.addRestaurantCustomItem({
      shopId: state.activeShopId || 'ff22da9a-2623-4387-af37-6a8bb50bb19f',
      name: name.trim(),
      hindiName: hindiName.trim() || name.trim(),
      category,
      portionUnit,
      defaultQuantity: Number(defaultQuantity) || 50,
      storageCondition,
      shelfLifeHours: Number(shelfLifeHours) || 4,
      preparationTemperature: Number(preparationTemperature) || 68,
      isFssaiCompliant: true
    });

    setName('');
    setHindiName('');
    setDefaultQuantity(80);
    setShowAddForm(false);
    setSuccessToast(`"${name}" has been successfully added to your menu!`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleDeleteItem = (id: string, itemName: string) => {
    if (confirm(`Remove "${itemName}" from menu list?`)) {
      cache.deleteRestaurantCustomItem(id);
      setSuccessToast(`"${itemName}" removed.`);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner & Header */}
      <div 
        className="glass-panel" 
        style={{
          padding: '24px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '2px solid #e2e8f0',
          borderBottom: '4px solid #cbd5e1',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 300px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            backgroundColor: '#fff4e5',
            border: '2px solid #fed7aa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ea580c',
            boxShadow: '0 3px 0 #fb923c'
          }}>
            <UtensilsCrossed size={26} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
              Restaurant Dishes & Menu Management (व्यंजन सूची प्रबंधन)
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#64748b', marginTop: '4px', margin: 0, fontWeight: 500 }}>
              Save regular preparation items once. Declare surplus donations in 1-click with pre-verified FSSAI temperatures & safe holding limits.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            backgroundColor: showAddForm ? '#f1f5f9' : '#58cc02',
            color: showAddForm ? '#475569' : '#ffffff',
            border: showAddForm ? '2px solid #cbd5e1' : '2px solid #46a302',
            borderBottom: showAddForm ? '4px solid #94a3b8' : '4px solid #3b8801',
            borderRadius: '14px',
            padding: '12px 20px',
            fontWeight: 800,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 0 rgba(0,0,0,0.05)',
            transition: 'all 0.15s ease'
          }}
        >
          {showAddForm ? <X size={18} /> : <Plus size={18} />}
          {showAddForm ? 'Close Form (बंद करें)' : 'Add New Dish (नया व्यंजन जोड़ें)'}
        </button>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div style={{
          padding: '14px 18px',
          backgroundColor: '#e8fcd9',
          border: '2px solid #a5ed6e',
          borderRadius: '14px',
          color: '#2b7a0b',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 700,
          fontSize: '0.9rem',
          boxShadow: '0 3px 0 #79cc33'
        }}>
          <CheckCircle size={20} color="#2b7a0b" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Add New Dish Form (Collapsible Card) */}
      {showAddForm && (
        <div 
          className="glass-panel"
          style={{
            backgroundColor: '#ffffff',
            padding: '24px',
            borderRadius: '20px',
            border: '2px solid #e2e8f0',
            borderBottom: '5px solid #cbd5e1',
            boxShadow: '0 10px 25px rgba(0,0,0,0.06)'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #f1f5f9',
            paddingBottom: '14px',
            marginBottom: '18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="#ea580c" />
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>
                Add New Dish Template (नया व्यंजन विवरण जोड़ें)
              </h4>
            </div>
            <span style={{
              backgroundColor: '#fff4e5',
              color: '#c2410c',
              border: '1.5px solid #fed7aa',
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 800
            }}>
              FSSAI Standard Preset
            </span>
          </div>

          <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  Dish Name (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Braj Special Paneer & Poori Thali"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    outline: 'none',
                    backgroundColor: '#f8fafc'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  Dish Name (हिंदी)
                </label>
                <input
                  type="text"
                  placeholder="उदा. बृज स्पेशल पनीर व पूरी थाली"
                  value={hindiName}
                  onChange={(e) => setHindiName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    outline: 'none',
                    backgroundColor: '#f8fafc'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  Category (श्रेणी)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    outline: 'none',
                    backgroundColor: '#f8fafc'
                  }}
                >
                  <option value="Cooked Meals">Cooked Meals (पका हुआ भोजन)</option>
                  <option value="Snacks / Sweets">Snacks / Sweets (मिष्ठान व नाश्ता)</option>
                  <option value="Breads / Roti">Breads / Roti (रोटी व पूड़ी)</option>
                  <option value="Rice & Lentils">Rice & Lentils (दाल व चावल)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  Portion Unit (इकाई)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Plates, Kg, Portions"
                  value={portionUnit}
                  onChange={(e) => setPortionUnit(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    outline: 'none',
                    backgroundColor: '#f8fafc'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  Default Batch Quantity
                </label>
                <input
                  type="number"
                  min="5"
                  value={defaultQuantity}
                  onChange={(e) => setDefaultQuantity(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    outline: 'none',
                    backgroundColor: '#f8fafc'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  Storage Condition (सुरक्षा भंडारण)
                </label>
                <select
                  value={storageCondition}
                  onChange={(e) => setStorageCondition(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    outline: 'none',
                    backgroundColor: '#f8fafc'
                  }}
                >
                  <option value="hot_held">Hot Held (≥60°C गर्म नियंत्रित)</option>
                  <option value="room_temp">Room Temperature (सामान्य तापमान)</option>
                  <option value="refrigerated">Refrigerated (≤5°C शीत भंडार)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  Preparation Temperature (°C)
                </label>
                <input
                  type="number"
                  value={preparationTemperature}
                  onChange={(e) => setPreparationTemperature(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    outline: 'none',
                    backgroundColor: '#f8fafc'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  Max Safe Shelf Life (घंटे)
                </label>
                <input
                  type="number"
                  min="1"
                  max="48"
                  value={shelfLifeHours}
                  onChange={(e) => setShelfLifeHours(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    outline: 'none',
                    backgroundColor: '#f8fafc'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                style={{
                  backgroundColor: '#f8fafc',
                  color: '#64748b',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '10px 18px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Cancel (रद्द करें)
              </button>
              <button
                type="submit"
                style={{
                  backgroundColor: '#58cc02',
                  color: '#ffffff',
                  border: '2px solid #46a302',
                  borderBottom: '4px solid #3b8801',
                  borderRadius: '12px',
                  padding: '10px 22px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Plus size={18} />
                Save Dish (व्यंजन सुरक्षित करें)
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div 
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        {/* Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {categories.map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  backgroundColor: isActive ? '#58cc02' : '#ffffff',
                  color: isActive ? '#ffffff' : '#475569',
                  border: isActive ? '2px solid #46a302' : '2px solid #e2e8f0',
                  borderBottom: isActive ? '3px solid #3b8801' : '3px solid #cbd5e1',
                  borderRadius: '9999px',
                  padding: '6px 16px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 2px 0 rgba(0,0,0,0.03)',
                  transition: 'all 0.1s ease',
                  minHeight: '34px'
                }}
              >
                {cat === 'All' ? '🌟 ALL ITEMS' : cat.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div style={{
          position: 'relative',
          minWidth: '240px',
          flex: '1 1 240px',
          maxWidth: '380px'
        }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search items by name / खोजें..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 14px 8px 36px',
              borderRadius: '9999px',
              border: '2px solid #e2e8f0',
              borderBottom: '3px solid #cbd5e1',
              fontSize: '0.85rem',
              fontWeight: 600,
              backgroundColor: '#ffffff',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Dish Items Grid */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px'
        }}
      >
        {filteredItems.map((item: RestaurantCustomItem) => {
          const isHot = item.storageCondition === 'hot_held';
          const isCold = item.storageCondition === 'refrigerated';

          return (
            <div
              key={item.id}
              className="glass-panel"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '18px',
                border: '2px solid #e2e8f0',
                borderBottom: '5px solid #cbd5e1',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                transition: 'transform 0.15s ease'
              }}
            >
              <div>
                {/* Header: Title and Delete */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>
                      {item.name}
                    </h4>
                    <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>
                      {item.hindiName}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id, item.name)}
                    title="Remove item"
                    style={{
                      width: '34px',
                      height: '34px',
                      minWidth: '34px',
                      minHeight: '34px',
                      padding: 0,
                      borderRadius: '10px',
                      backgroundColor: '#fff1f2',
                      border: '1.5px solid #fecdd3',
                      borderBottom: '3px solid #fda4af',
                      color: '#e11d48',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Tags row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                  <span style={{
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}>
                    {item.category}
                  </span>

                  <span style={{
                    backgroundColor: '#fff4e5',
                    color: '#c2410c',
                    border: '1px solid #fed7aa',
                    borderRadius: '8px',
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Clock size={12} />
                    {item.shelfLifeHours}h Window
                  </span>

                  <span style={{
                    backgroundColor: isHot ? '#fef2f2' : isCold ? '#eff6ff' : '#f8fafc',
                    color: isHot ? '#b91c1c' : isCold ? '#1d4ed8' : '#475569',
                    border: `1px solid ${isHot ? '#fecaca' : isCold ? '#bfdbfe' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Flame size={12} />
                    {item.preparationTemperature}°C
                  </span>

                  <span style={{
                    backgroundColor: '#e8fcd9',
                    color: '#2b7a0b',
                    border: '1px solid #a5ed6e',
                    borderRadius: '8px',
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <ShieldCheck size={12} />
                    FSSAI
                  </span>
                </div>

                <div style={{
                  marginTop: '12px',
                  padding: '8px 12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#475569'
                }}>
                  Standard Batch: <strong style={{ color: '#0f172a' }}>{item.defaultQuantity} {item.portionUnit}</strong>
                </div>
              </div>

              {/* 1-Click Surplus Action Button */}
              <button
                type="button"
                onClick={() => onQuickDonateSurplus && onQuickDonateSurplus(item)}
                style={{
                  width: '100%',
                  backgroundColor: '#ff9600',
                  color: '#ffffff',
                  border: '2px solid #e07f00',
                  borderBottom: '4px solid #c26900',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 0 rgba(0,0,0,0.06)',
                  transition: 'all 0.1s ease',
                  minHeight: '42px'
                }}
              >
                <Zap size={16} fill="#ffffff" color="#ffffff" />
                <span>1-CLICK SURPLUS DECLARE (अधिशेष भोजन घोषित करें)</span>
              </button>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div 
          className="glass-panel"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            border: '2px dashed #cbd5e1',
            padding: '40px 20px',
            textAlign: 'center'
          }}
        >
          <UtensilsCrossed size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#475569' }}>
            No dishes found matching your query
          </h4>
          <p style={{ margin: '4px 0 16px 0', fontSize: '0.85rem', color: '#94a3b8' }}>
            Try a different search term or add a new dish to your menu.
          </p>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            style={{
              backgroundColor: '#58cc02',
              color: '#ffffff',
              border: '2px solid #46a302',
              borderBottom: '4px solid #3b8801',
              borderRadius: '12px',
              padding: '10px 18px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            + Add New Dish Now
          </button>
        </div>
      )}
    </div>
  );
};
