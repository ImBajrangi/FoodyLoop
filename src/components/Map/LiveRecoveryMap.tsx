import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Navigation,
  Layers,
  MapPin,
  Bike,
  Store,
  Home,
  Compass,
  Maximize2,
  Minimize2,
  RefreshCw,
  Phone,
  Clock
} from 'lucide-react';
import { useAppState } from '../../services/useAppState';
import type { Donation, Shop, Ngo, Beneficiary } from '../../types';
import { getRoadRoute } from '../../services/routingService';
import { cache } from '../../services/cache';

interface LiveRecoveryMapProps {
  activeDonationId?: string;
  height?: string;
  className?: string;
  defaultFilter?: 'all' | 'shops' | 'ngos' | 'riders';
  showLayerControls?: boolean;
  onSelectDonation?: (donationId: string) => void;
  onPlaceHands?: (donationId: string) => void;
}

export const LiveRecoveryMap: React.FC<LiveRecoveryMapProps> = ({
  activeDonationId,
  height = '420px',
  className = '',
  defaultFilter = 'all',
  showLayerControls = true,
  onSelectDonation,
  onPlaceHands
}) => {
  const { state } = useAppState();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeFilter, setActiveFilter] = useState<'all' | 'shops' | 'ngos' | 'riders'>(defaultFilter);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [routeMeta, setRouteMeta] = useState<{
    distanceText?: string;
    durationText?: string;
    isRealRoad?: boolean;
  } | null>(null);
  const [selectedPinInfo, setSelectedPinInfo] = useState<{
    type: 'shop' | 'ngo' | 'rider';
    title: string;
    subtitle: string;
    details: string;
    phone?: string;
    etaMinutes?: number;
    donationId?: string;
  } | null>(null);

  // Active tracking donation
  const trackingDonation = useMemo(() => {
    if (activeDonationId) {
      return state.donations.find((d: Donation) => d.id === activeDonationId);
    }
    // Default to the first active/dispatched donation if available
    return state.donations.find((d: Donation) => d.riderStatus || d.status === 'PICKUP_ASSIGNED' || d.status === 'COLLECTED');
  }, [activeDonationId, state.donations]);

  // Center coordinate: Braj region default
  const defaultCenter = useMemo<[number, number]>(() => {
    if (trackingDonation?.riderLat && trackingDonation?.riderLng) {
      return [trackingDonation.riderLat, trackingDonation.riderLng];
    }
    const activeShop = state.shops.find((s: Shop) => s.id === state.activeShopId) || state.shops[0];
    return [activeShop?.lat || 27.5706, activeShop?.lng || 77.6593];
  }, [trackingDonation, state.shops, state.activeShopId]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up previous Leaflet instance if present on container
    if ((mapContainerRef.current as any)._leaflet_id) {
      (mapContainerRef.current as any)._leaflet_id = null;
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    // High performance crisp CARTO Voyager tiles with key from environment (exact matching foody_vrinda_v3)
    const cartoKey = ((import.meta.env as any).VITE_CARTO_BASEMAP_KEY || 'cb1_25xx_1_ef24909b63d9228a6de7508f').trim();
    const cartoSuffix = cartoKey ? `?key=${cartoKey}` : '';
    const mapTileUrl = `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png${cartoSuffix}`;

    L.tileLayer(mapTileUrl, {
      maxZoom: 20,
      minZoom: 4,
      subdomains: 'abcd',
      attribution: '&copy; CARTO &copy; OpenStreetMap'
    }).addTo(map);

    const routeLayerGroup = L.layerGroup().addTo(map);
    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    routeLayerGroupRef.current = routeLayerGroup;
    mapInstanceRef.current = map;

    // Invalidate size after layout stabilization
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      if (routeLayerGroupRef.current) {
        routeLayerGroupRef.current.clearLayers();
        routeLayerGroupRef.current = null;
      }
      if (layerGroupRef.current) {
        layerGroupRef.current.clearLayers();
        layerGroupRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers and Dynamic Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const bounds = L.latLngBounds([]);

    // 1. Render Donor Shops / Restaurants
    if (activeFilter === 'all' || activeFilter === 'shops') {
      state.shops.forEach((shop: Shop) => {
        if (!shop.lat || !shop.lng) return;

        const hasSurplus = state.donations.some(
          (d: Donation) => d.donorShopId === shop.id && (d.status === 'AVAILABLE' || d.status === 'PICKUP_ASSIGNED')
        );

        const shopIcon = L.divIcon({
          className: 'custom-shop-marker',
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
              <div style="
                width: 38px;
                height: 38px;
                background: ${hasSurplus ? '#D97706' : '#1E293B'};
                border: 2.5px solid #FFFFFF;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 14px rgba(0,0,0,0.3);
                transition: transform 0.2s ease;
              ">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
                  <path d="M7 2v20"/>
                  <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
                </svg>
              </div>
              ${hasSurplus ? `
                <div style="
                  position: absolute;
                  top: -4px;
                  right: -4px;
                  width: 14px;
                  height: 14px;
                  background: #10B981;
                  border: 2px solid #FFFFFF;
                  border-radius: 50%;
                "></div>
              ` : ''}
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 19]
        });

        const marker = L.marker([shop.lat, shop.lng], { icon: shopIcon });
        marker.on('click', () => {
          const shopDonation = state.donations.find((d: Donation) => d.donorShopId === shop.id);
          setSelectedPinInfo({
            type: 'shop',
            title: shop.name,
            subtitle: `${shop.category} • ${shop.city}`,
            details: `${shop.address} | FSSAI: ${shop.fssaiNumber || 'Verified'}`,
            phone: shop.phone,
            donationId: shopDonation?.id
          });
        });

        layerGroup.addLayer(marker);
        bounds.extend([shop.lat, shop.lng]);
      });
    }

    // 2. Render NGOs / Ashrams / Beneficiaries
    if (activeFilter === 'all' || activeFilter === 'ngos') {
      state.ngos.forEach((ngo: Ngo) => {
        if (!ngo.lat || !ngo.lng) return;

        const ngoIcon = L.divIcon({
          className: 'custom-ngo-marker',
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
              <div style="
                width: 38px;
                height: 38px;
                background: #4F46E5;
                border: 2.5px solid #FFFFFF;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 14px rgba(0,0,0,0.3);
              ">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 19]
        });

        const marker = L.marker([ngo.lat, ngo.lng], { icon: ngoIcon });
        marker.on('click', () => {
          setSelectedPinInfo({
            type: 'ngo',
            title: ngo.name,
            subtitle: `Capacity: ${ngo.capacity} meals/day • ${ngo.city}`,
            details: `${ngo.address} | Contact: ${ngo.contactPerson}`,
            phone: ngo.phone
          });
        });

        layerGroup.addLayer(marker);
        bounds.extend([ngo.lat, ngo.lng]);
      });
    }

    // 3. Render Active Delivery Couriers with Animated Radar Ping
    if (activeFilter === 'all' || activeFilter === 'riders') {
      state.donations.forEach((donation: Donation) => {
        if (!donation.riderLat || !donation.riderLng || donation.riderStatus === 'DELIVERED') return;

        const isHeadingToShop = donation.riderStatus === 'HEADING_TO_SHOP';
        const isAtShop = donation.riderStatus === 'AT_SHOP_PICKUP';
        const statusLabel = isHeadingToShop
          ? 'Heading to Restaurant'
          : isAtShop
            ? 'At Shop for Pickup'
            : 'En Route to Ashram';

        const riderIcon = L.divIcon({
          className: 'custom-rider-marker',
          html: `
            <div style="position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
              <div style="
                position: absolute;
                width: 44px;
                height: 44px;
                border-radius: 50%;
                border: 2px solid #E0FF33;
                background: rgba(224, 255, 51, 0.2);
                animation: pulse 1.8s infinite;
              "></div>
              <div style="
                position: relative;
                width: 36px;
                height: 36px;
                background: #0F172A;
                border: 2.5px solid #E0FF33;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 14px rgba(0,0,0,0.5);
              ">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E0FF33" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="18.5" cy="17.5" r="2.5"></circle>
                  <circle cx="5.5" cy="17.5" r="2.5"></circle>
                  <path d="M15 6h-5a2 2 0 0 0-2 2v2"></path>
                  <path d="M6 10h12l-1.5 5.5H8.5L6 10z"></path>
                  <path d="M9 18h6"></path>
                </svg>
              </div>
            </div>
          `,
          iconSize: [48, 48],
          iconAnchor: [24, 24]
        });

        const marker = L.marker([donation.riderLat, donation.riderLng], { icon: riderIcon, zIndexOffset: 800 });
        marker.on('click', () => {
          setSelectedPinInfo({
            type: 'rider',
            title: donation.assignedVolunteerName || 'Delivery Seva Partner',
            subtitle: `${statusLabel} • ${donation.riderEtaMinutes || 5} min ETA`,
            details: `Carrying: ${donation.quantity} ${donation.unit} ${donation.foodItem} | From: ${donation.donorShopName}`,
            phone: donation.riderPhone || '+91 98765 43210',
            etaMinutes: donation.riderEtaMinutes || 5,
            donationId: donation.id
          });
        });

        layerGroup.addLayer(marker);
        bounds.extend([donation.riderLat, donation.riderLng]);
      });
    }

    // Fit map bounds if points exist
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [state.shops, state.ngos, state.donations, activeFilter]);

  // Real-World Road Route Computation & Dynamic Street Navigation
  useEffect(() => {
    const map = mapInstanceRef.current;
    const routeGroup = routeLayerGroupRef.current;
    if (!map || !routeGroup) return;

    let isCancelled = false;

    if (!trackingDonation) {
      routeGroup.clearLayers();
      setRouteMeta(null);
      return;
    }

    const shop = state.shops.find((s: Shop) => s.id === trackingDonation.donorShopId);
    const ben = state.beneficiaries.find((b: Beneficiary) => b.id === trackingDonation.targetBeneficiaryId);
    const ngo = state.ngos.find((n: Ngo) => n.id === trackingDonation.matchedNgoId);

    const shopCoords: [number, number] = [shop?.lat || 27.5706, shop?.lng || 77.6743];
    const destCoords: [number, number] = [ben?.lat || ngo?.lat || 27.5810, ben?.lng || ngo?.lng || 77.6850];

    const isHeadingToShop = trackingDonation.riderStatus === 'HEADING_TO_SHOP';
    const isAtShop = trackingDonation.riderStatus === 'AT_SHOP_PICKUP';
    const isOutForDelivery = trackingDonation.riderStatus === 'OUT_FOR_DELIVERY';

    let startPoint: [number, number];
    let endPoint: [number, number];

    if (isHeadingToShop && trackingDonation.riderLat && trackingDonation.riderLng) {
      startPoint = [trackingDonation.riderLat, trackingDonation.riderLng];
      endPoint = shopCoords;
    } else if (isAtShop) {
      startPoint = shopCoords;
      endPoint = destCoords;
    } else if (isOutForDelivery && trackingDonation.riderLat && trackingDonation.riderLng) {
      startPoint = [trackingDonation.riderLat, trackingDonation.riderLng];
      endPoint = destCoords;
    } else {
      startPoint = shopCoords;
      endPoint = destCoords;
    }

    getRoadRoute(startPoint[0], startPoint[1], endPoint[0], endPoint[1]).then(result => {
      if (isCancelled || !routeLayerGroupRef.current) return;

      routeGroup.clearLayers();

      // Outer road contrast casing (dark forest green underlay matching Google Maps / Swiggy)
      L.polyline(result.coordinates, {
        color: '#064e3b',
        weight: 6.5,
        opacity: 0.7,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(routeGroup);

      // Inner active road line (vibrant emerald dashed path following real streets)
      L.polyline(result.coordinates, {
        color: '#10b981',
        weight: 3.5,
        opacity: 0.95,
        dashArray: '7, 9',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(routeGroup);

      // If courier is heading to shop, also render the upcoming leg from shop to ashram with subtle indigo dashed styling
      if (isHeadingToShop) {
        getRoadRoute(shopCoords[0], shopCoords[1], destCoords[0], destCoords[1]).then(leg2Result => {
          if (isCancelled || !routeLayerGroupRef.current) return;
          L.polyline(leg2Result.coordinates, {
            color: '#6366f1',
            weight: 2.5,
            opacity: 0.45,
            dashArray: '4, 8',
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(routeGroup);
        });
      }

      // If out for delivery, show completed route trail from shop to rider
      if (isOutForDelivery && trackingDonation.riderLat && trackingDonation.riderLng) {
        getRoadRoute(shopCoords[0], shopCoords[1], trackingDonation.riderLat, trackingDonation.riderLng).then(completedResult => {
          if (isCancelled || !routeLayerGroupRef.current) return;
          L.polyline(completedResult.coordinates, {
            color: '#059669',
            weight: 3,
            opacity: 0.45,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(routeGroup);
        });
      }

      // Sync road waypoints to cache so rider simulation steps along the real street network
      if (result.isRealRoad && result.coordinates.length > 2) {
        cache.setDonationRouteWaypoints(trackingDonation.id, result.coordinates);
      }

      if (result.distanceMeters && result.durationSeconds) {
        setRouteMeta({
          distanceText: `${(result.distanceMeters / 1000).toFixed(1)} km`,
          durationText: `${Math.max(1, Math.round(result.durationSeconds / 60))} min`,
          isRealRoad: result.isRealRoad
        });
      } else {
        setRouteMeta(null);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [
    trackingDonation?.id,
    trackingDonation?.riderLat,
    trackingDonation?.riderLng,
    trackingDonation?.riderStatus,
    trackingDonation?.donorShopId,
    trackingDonation?.targetBeneficiaryId,
    trackingDonation?.matchedNgoId,
    state.shops,
    state.ngos,
    state.beneficiaries
  ]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(defaultCenter, 14, { animate: true });
    }
  };

  return (
    <div 
      style={{ 
        position: 'relative', 
        backgroundColor: '#0f172a', 
        borderRadius: '20px', 
        overflow: 'hidden', 
        border: '2px solid #e2e8f0', 
        borderBottom: '4px solid #cbd5e1',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)' 
      }}
      className={className}
    >
      {/* Top Map Floating Bar */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        right: '12px',
        zIndex: 600,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        pointerEvents: 'none'
      }}>
        {/* Layer Filter Pills */}
        {showLayerControls && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            borderRadius: '14px',
            border: '2px solid #e2e8f0',
            boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
            pointerEvents: 'auto'
          }}>
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              style={{
                padding: '5px 12px',
                fontSize: '0.75rem',
                fontWeight: 800,
                borderRadius: '10px',
                cursor: 'pointer',
                border: activeFilter === 'all' ? '1.5px solid #e07f00' : '1.5px solid transparent',
                backgroundColor: activeFilter === 'all' ? '#ff9600' : 'transparent',
                color: activeFilter === 'all' ? '#ffffff' : '#475569',
                minHeight: '30px'
              }}
            >
              🌐 All
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('shops')}
              style={{
                padding: '5px 12px',
                fontSize: '0.75rem',
                fontWeight: 800,
                borderRadius: '10px',
                cursor: 'pointer',
                border: activeFilter === 'shops' ? '1.5px solid #e07f00' : '1.5px solid transparent',
                backgroundColor: activeFilter === 'shops' ? '#ff9600' : 'transparent',
                color: activeFilter === 'shops' ? '#ffffff' : '#475569',
                minHeight: '30px'
              }}
            >
              🏪 Shops
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('ngos')}
              style={{
                padding: '5px 12px',
                fontSize: '0.75rem',
                fontWeight: 800,
                borderRadius: '10px',
                cursor: 'pointer',
                border: activeFilter === 'ngos' ? '1.5px solid #4338ca' : '1.5px solid transparent',
                backgroundColor: activeFilter === 'ngos' ? '#4f46e5' : 'transparent',
                color: activeFilter === 'ngos' ? '#ffffff' : '#475569',
                minHeight: '30px'
              }}
            >
              🏛️ Ashrams
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('riders')}
              style={{
                padding: '5px 12px',
                fontSize: '0.75rem',
                fontWeight: 800,
                borderRadius: '10px',
                cursor: 'pointer',
                border: activeFilter === 'riders' ? '1.5px solid #46a302' : '1.5px solid transparent',
                backgroundColor: activeFilter === 'riders' ? '#58cc02' : 'transparent',
                color: activeFilter === 'riders' ? '#ffffff' : '#475569',
                minHeight: '30px'
              }}
            >
              🚴 Couriers
            </button>
          </div>
        )}

        {/* Real-time Road Route Navigation Pill */}
        {routeMeta && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            backgroundColor: 'rgba(6, 78, 59, 0.92)',
            backdropFilter: 'blur(8px)',
            borderRadius: '14px',
            border: '1.5px solid #10b981',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
            fontSize: '0.74rem',
            fontWeight: 800,
            pointerEvents: 'auto'
          }}>
            <span style={{ color: '#a7f3d0' }}>🛣️ GPS Road:</span>
            <span>{routeMeta.distanceText}</span>
            <span style={{ color: '#6ee7b7' }}>•</span>
            <span style={{ color: '#fef08a' }}>{routeMeta.durationText}</span>
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'auto', marginLeft: 'auto' }}>
          <button
            type="button"
            onClick={handleRecenter}
            title="Recenter Map"
            style={{
              width: '36px',
              height: '36px',
              minWidth: '36px',
              minHeight: '36px',
              padding: 0,
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '2px solid #e2e8f0',
              borderBottom: '3px solid #cbd5e1',
              color: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 3px 6px rgba(0,0,0,0.08)'
            }}
          >
            <Compass size={18} />
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Toggle Size"
            style={{
              width: '36px',
              height: '36px',
              minWidth: '36px',
              minHeight: '36px',
              padding: 0,
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '2px solid #e2e8f0',
              borderBottom: '3px solid #cbd5e1',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 3px 6px rgba(0,0,0,0.08)'
            }}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      {/* Map Container Element */}
      <div
        ref={mapContainerRef}
        style={{ height: isFullscreen ? '78vh' : height, minHeight: '320px', width: '100%', zIndex: 0 }}
      />

      {/* Selected Marker Detail Card */}
      {selectedPinInfo && (
        <div 
          className="glass-panel"
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            right: '12px',
            zIndex: 600,
            padding: '16px 20px',
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            border: '2px solid #e2e8f0',
            borderBottom: '4px solid #cbd5e1',
            boxShadow: '0 12px 32px rgba(0,0,0,0.18)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: selectedPinInfo.type === 'rider' ? '#e8fcd9' : selectedPinInfo.type === 'shop' ? '#fff4e5' : '#e0e7ff',
                color: selectedPinInfo.type === 'rider' ? '#2b7a0b' : selectedPinInfo.type === 'shop' ? '#c2410c' : '#4338ca',
                border: `1.5px solid ${selectedPinInfo.type === 'rider' ? '#a5ed6e' : selectedPinInfo.type === 'shop' ? '#fed7aa' : '#c7d2fe'}`
              }}>
                {selectedPinInfo.type === 'rider' ? <Bike size={22} /> : selectedPinInfo.type === 'shop' ? <Store size={22} /> : <Home size={22} />}
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {selectedPinInfo.title}
                  {selectedPinInfo.type === 'rider' && (
                    <span style={{
                      backgroundColor: '#e8fcd9',
                      color: '#2b7a0b',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      border: '1px solid #a5ed6e'
                    }}>
                      LIVE GPS
                    </span>
                  )}
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>
                  {selectedPinInfo.subtitle}
                </p>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  {selectedPinInfo.details}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedPinInfo(null)}
              style={{
                width: '28px',
                height: '28px',
                minWidth: '28px',
                minHeight: '28px',
                padding: 0,
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.8rem'
              }}
            >
              ✕
            </button>
          </div>

          <div style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1.5px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {selectedPinInfo.phone ? (
              <a
                href={`tel:${selectedPinInfo.phone}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#ea580c',
                  textDecoration: 'none'
                }}
              >
                <Phone size={14} /> Call: {selectedPinInfo.phone}
              </a>
            ) : <span />}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {selectedPinInfo.donationId && onPlaceHands && (
                <button
                  type="button"
                  onClick={() => {
                    onPlaceHands(selectedPinInfo.donationId!);
                    setSelectedPinInfo(null);
                  }}
                  style={{
                    backgroundColor: '#ff9600',
                    color: '#ffffff',
                    border: '1.5px solid #e07f00',
                    borderBottom: '3px solid #c26900',
                    borderRadius: '10px',
                    padding: '6px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    minHeight: '32px'
                  }}
                >
                  ✋ Hands on Food
                </button>
              )}
              {selectedPinInfo.donationId && onSelectDonation && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectDonation(selectedPinInfo.donationId!);
                    setSelectedPinInfo(null);
                  }}
                  style={{
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    border: '1.5px solid #4338ca',
                    borderBottom: '3px solid #3730a3',
                    borderRadius: '10px',
                    padding: '6px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    minHeight: '32px'
                  }}
                >
                  Track Dispatch
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
