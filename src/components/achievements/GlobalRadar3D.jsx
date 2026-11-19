'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import * as THREE from 'three';
import { XORAZM_ORIGIN, ABROAD_STUDENTS } from '@/data/abroadStudents';
import {
  Globe as GlobeIcon,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RotateCcw,
  Users,
  CheckCircle2,
  BookmarkCheck,
  User,
  Plus,
  Minus,
  RefreshCw,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

// Dynamically import Globe to prevent SSR issues
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

function projectTo2D(lat, lng) {
  const x = 400 + (lng / 180) * 360;
  const y = 210 - (lat / 90) * 180;
  return { x, y };
}

function getSvgArc(p1, p2) {
  const dx = p2.x - p1.x;
  const cx = (p1.x + p2.x) / 2;
  const cy = (p1.y + p2.y) / 2 - Math.abs(dx) * 0.25 - 20;
  return `M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`;
}

function geoToSvgPath(geometry) {
  if (!geometry) return '';
  const project = ([lng, lat]) => {
    const x = (400 + (lng / 180) * 360).toFixed(1);
    const y = (210 - (lat / 90) * 180).toFixed(1);
    return `${x},${y}`;
  };

  if (geometry.type === 'Polygon') {
    return geometry.coordinates
      .map((ring) => 'M' + ring.map(project).join('L') + 'Z')
      .join(' ');
  } else if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates
      .map((polygon) =>
        polygon.map((ring) => 'M' + ring.map(project).join('L') + 'Z').join(' ')
      )
      .join(' ');
  }
  return '';
}

export default function GlobalRadar3D() {
  const { t, translations } = useLanguage();
  const globeRef = useRef();
  const containerRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0); // Default to first
  const [countries, setCountries] = useState({ features: [] });
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [globeDimensions, setGlobeDimensions] = useState({ width: 650, height: 520 });

  // 2D World Map Pan & Zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const touchStartRef = useRef({ x: 0, y: 0 });

  // Custom Sky Blue Globe Material for Oceans
  const customGlobeMaterial = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      color: new THREE.Color('#38bdf8'),
      shininess: 12,
    });
  }, []);

  useEffect(() => {
    setMounted(true);

    fetch(
      'https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson'
    )
      .then((res) => res.json())
      .then((data) => setCountries(data))
      .catch((err) => console.error('Error loading world borders:', err));

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const updateDimensions = () => {
      if (typeof window !== 'undefined') {
        const mobileCheck = window.innerWidth < 768;
        setIsMobile(mobileCheck);
        if (window.innerWidth < 640) {
          setGlobeDimensions({ width: window.innerWidth - 48, height: 340 });
        } else if (window.innerWidth < 1024) {
          setGlobeDimensions({ width: 600, height: 420 });
        } else {
          setGlobeDimensions({ width: 650, height: 520 });
        }
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const activeStudent = currentIndex !== null ? ABROAD_STUDENTS[currentIndex] : null;

  // Camera handling for 3D Globe (desktop)
  useEffect(() => {
    if (globeRef.current && isVisible && !isMobile) {
      if (activeStudent) {
        globeRef.current.pointOfView(
          { lat: activeStudent.lat, lng: activeStudent.lng, altitude: 2.1 },
          1000
        );
      } else {
        globeRef.current.pointOfView(
          { lat: 35, lng: 50, altitude: 2.6 },
          1000
        );
      }
    }
  }, [currentIndex, activeStudent, isVisible, isMobile]);

  const handleChipClick = (index) => {
    if (currentIndex === index) {
      setCurrentIndex(null);
    } else {
      setCurrentIndex(index);
    }
  };

  const handleNext = () => {
    if (currentIndex === null) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex((prev) => (prev + 1) % ABROAD_STUDENTS.length);
    }
  };

  const handlePrev = () => {
    if (currentIndex === null) {
      setCurrentIndex(ABROAD_STUDENTS.length - 1);
    } else {
      setCurrentIndex((prev) =>
        prev === 0 ? ABROAD_STUDENTS.length - 1 : prev - 1
      );
    }
  };

  // Zoom Control Handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.5, 1));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Touch Pan Handlers (only active when zoomed in > 1x)
  const handleTouchStart = (e) => {
    if (zoom > 1 && e.touches.length === 1) {
      setIsDragging(true);
      touchStartRef.current = {
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      };
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging && zoom > 1 && e.touches.length === 1) {
      setPan({
        x: e.touches[0].clientX - touchStartRef.current.x,
        y: e.touches[0].clientY - touchStartRef.current.y,
      });
    }
  };

  const handleTouchEnd = () => setIsDragging(false);

  const singleArcData = activeStudent
    ? [
        {
          startLat: XORAZM_ORIGIN.lat,
          startLng: XORAZM_ORIGIN.lng,
          endLat: activeStudent.lat,
          endLng: activeStudent.lng,
          color: activeStudent.status === 'enrolled' ? '#10b981' : '#f59e0b',
        },
      ]
    : [];

  const pointsData = [
    {
      lat: XORAZM_ORIGIN.lat,
      lng: XORAZM_ORIGIN.lng,
      size: 0.8,
      color: '#059669',
      name: 'Xorazm IM Base',
    },
    ...ABROAD_STUDENTS.map((s, idx) => {
      const isSelected = idx === currentIndex;
      const isEnrolled = s.status === 'enrolled';
      return {
        lat: s.lat,
        lng: s.lng,
        size: isSelected ? 1.1 : 0.7,
        color: isSelected
          ? '#3b82f6'
          : isEnrolled
          ? '#eab308'
          : '#f97316',
        studentIndex: idx,
      };
    }),
  ];

  const originP = projectTo2D(XORAZM_ORIGIN.lat, XORAZM_ORIGIN.lng);

  return (
    <div ref={containerRef} className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b theme-border">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold uppercase mb-2">
            <GlobeIcon className="w-3.5 h-3.5 animate-pulse" /> {t('achievements', 'radarBadge')}
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold theme-text-primary">
            {t('achievements', 'radarTitle')}
          </h2>
          <p className="text-xs theme-text-secondary mt-1">
            {t('achievements', 'radarSubtitle')}
          </p>
        </div>

        {/* University Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {ABROAD_STUDENTS.map((s, idx) => {
            const isActive = idx === currentIndex;
            const isEnrolled = s.status === 'enrolled';
            return (
              <button
                key={s.id}
                onClick={() => handleChipClick(idx)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 sm:gap-2 border cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold shadow-md shadow-emerald-500/10 scale-105'
                    : 'theme-bg-card theme-border theme-text-secondary hover:theme-text-primary'
                }`}
              >
                <span>{s.flag}</span>
                <span>{s.shortName}</span>
                {isEnrolled && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </button>
            );
          })}

          {currentIndex !== null && (
            <button
              onClick={() => setCurrentIndex(null)}
              className="px-3 py-1.5 rounded-xl text-xs font-mono bg-white/5 border theme-border text-sky-400 hover:bg-sky-500/10 flex items-center gap-1 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> {t('achievements', 'allPlaces')}
            </button>
          )}
        </div>
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full max-w-full">
        
        {/* LEFT SIDE: Interactive Radar View (3D WebGL Globe on Desktop >=768px, Interactive 2D Vector World Map on Mobile <768px) */}
        <div className="lg:col-span-7 relative w-full h-[340px] sm:h-[420px] lg:h-[520px] rounded-3xl bg-[#0a0f18] border border-white/10 overflow-hidden flex items-center justify-center shadow-lg">

          {/* MOBILE INTERACTIVE 2D VECTOR WORLD MAP (< 768px) */}
          {isMobile ? (
            <div
              className="relative w-full h-full overflow-hidden flex items-center justify-center select-none"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Floating Map Controls (Top Right) */}
              <div className="absolute top-3 right-3 z-30 flex flex-col gap-1 bg-zinc-950/90 p-1 rounded-xl border border-white/10 shadow-lg">
                <button
                  onClick={handleZoomIn}
                  aria-label="Zoom In"
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/90 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={handleZoomOut}
                  aria-label="Zoom Out"
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/90 transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={handleResetZoom}
                  aria-label="Reset Map"
                  className="p-1.5 rounded-lg hover:bg-white/10 text-sky-400 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 2D SVG World Map Container */}
              <div
                className="w-full h-full flex items-center justify-center transition-transform duration-150 ease-out will-change-transform"
                style={{
                  transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
                  transformOrigin: 'center center',
                }}
              >
                <svg viewBox="0 0 800 420" className="w-full h-full">
                  {/* Lat/Lng Grid Lines */}
                  <line x1="0" y1="105" x2="800" y2="105" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4 4" />
                  <line x1="0" y1="210" x2="800" y2="210" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="4 4" />
                  <line x1="0" y1="315" x2="800" y2="315" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4 4" />

                  <line x1="200" y1="0" x2="200" y2="420" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4 4" />
                  <line x1="400" y1="0" x2="400" y2="420" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="4 4" />
                  <line x1="600" y1="0" x2="600" y2="420" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4 4" />

                  {/* Real World Country Polygons */}
                  {countries.features.map((country, idx) => {
                    const pathData = geoToSvgPath(country.geometry);
                    return (
                      <path
                        key={idx}
                        d={pathData}
                        fill="#162032"
                        stroke="#2a3954"
                        strokeWidth="0.5"
                        className="transition-colors hover:fill-slate-700"
                      />
                    );
                  })}

                  {/* Trajectory Arc to Selected University */}
                  {activeStudent && (() => {
                    const destP = projectTo2D(activeStudent.lat, activeStudent.lng);
                    const arcPath = getSvgArc(originP, destP);
                    const arcColor = activeStudent.status === 'enrolled' ? '#eab308' : '#f97316';
                    return (
                      <g>
                        <path
                          d={arcPath}
                          fill="none"
                          stroke={arcColor}
                          strokeWidth="2.5"
                          strokeDasharray="6 4"
                          className="animate-pulse"
                        />
                      </g>
                    );
                  })()}

                  {/* Xonqa IM Base Pin */}
                  <g>
                    <circle cx={originP.x} cy={originP.y} r="9" fill="#10b981" opacity="0.25" className="animate-ping" />
                    <circle cx={originP.x} cy={originP.y} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                    <text x={originP.x + 8} y={originP.y - 6} fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold">
                      Xonqa IM Base
                    </text>
                  </g>

                  {/* University Pins */}
                  {ABROAD_STUDENTS.map((s, idx) => {
                    const p = projectTo2D(s.lat, s.lng);
                    const isSelected = idx === currentIndex;
                    const isEnrolled = s.status === 'enrolled';
                    const color = isEnrolled ? '#eab308' : '#f97316';
                    const showLabel = isSelected || zoom >= 2.5;

                    return (
                      <g
                        key={s.id}
                        onClick={() => handleChipClick(idx)}
                        className="cursor-pointer group"
                      >
                        {isSelected && (
                          <>
                            <circle cx={p.x} cy={p.y} r="15" fill="none" stroke={color} strokeWidth="1.5" className="animate-ping" />
                            <circle cx={p.x} cy={p.y} r="11" fill="none" stroke="#3b82f6" strokeWidth="2" />
                          </>
                        )}
                        <circle cx={p.x} cy={p.y} r={isSelected ? "6.5" : "5"} fill={color} stroke="#ffffff" strokeWidth="1.5" />

                        {showLabel && (
                          <g transform={`translate(${p.x + 8}, ${p.y - 4})`}>
                            <rect
                              x="0"
                              y="-10"
                              width={s.shortName.length * 7 + 12}
                              height="16"
                              rx="4"
                              fill="#090d16"
                              stroke={isSelected ? '#3b82f6' : '#334155'}
                              strokeWidth="1"
                            />
                            <text
                              x="6"
                              y="2"
                              fill={isSelected ? '#3b82f6' : '#f8fafc'}
                              fontSize="9"
                              fontFamily="monospace"
                              fontWeight={isSelected ? 'bold' : 'normal'}
                            >
                              {s.shortName}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          ) : (
            /* DESKTOP 3D WEBGL GLOBE (>= 768px) */
            mounted && isVisible && (
              <Globe
                ref={globeRef}
                backgroundColor="rgba(0,0,0,0)"
                globeMaterial={customGlobeMaterial}
                width={globeDimensions.width}
                height={globeDimensions.height}
                showAtmosphere={true}
                atmosphereColor="#60a5fa"
                atmosphereAltitude={0.14}

                polygonsData={countries.features}
                polygonCapColor={() => '#f8fafc'}
                polygonSideColor={() => '#e2e8f0'}
                polygonStrokeColor={() => '#94a3b8'}

                arcsData={singleArcData}
                arcColor="color"
                arcDashLength={1}
                arcDashGap={0}
                arcDashAnimateTime={0}
                arcStroke={2.5}

                pointsData={pointsData}
                pointColor="color"
                pointRadius="size"
                pointAltitude={0.015}
                pointResolution={24}
                onPointClick={(pt) => {
                  if (pt.studentIndex !== undefined) {
                    if (currentIndex === pt.studentIndex) {
                      setCurrentIndex(null);
                    } else {
                      setCurrentIndex(pt.studentIndex);
                    }
                  }
                }}
              />
            )
          )}

          {/* Quick Legend Overlay */}
          <div className="absolute bottom-3 left-3 p-2.5 sm:p-3 rounded-2xl bg-zinc-950/90 border border-white/10 text-[10px] sm:text-[11px] font-mono text-white/80 space-y-1 z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span>{t('achievements', 'enrolled')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>{t('achievements', 'offerReceived')}</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Information Showcase Panel */}
        <div className="lg:col-span-5 h-full flex flex-col justify-between p-5 sm:p-6 md:p-8 rounded-3xl theme-bg-card border theme-border space-y-6">
          {activeStudent ? (
            <div className="space-y-5">
              {/* Status Badge & Flag Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b theme-border">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{activeStudent.flag}</span>
                    <span className="text-[11px] font-mono theme-text-secondary uppercase tracking-wider font-semibold">
                      {activeStudent.country}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-serif font-bold theme-text-primary leading-tight">
                    {activeStudent.university}
                  </h3>
                  <p className="text-xs theme-text-secondary flex items-center gap-1 mt-1 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" /> {activeStudent.city}
                  </p>
                </div>

                {/* Status Badge */}
                {activeStudent.status === 'enrolled' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[11px] sm:text-xs font-mono font-bold shrink-0 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {t('achievements', 'enrolled')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-[11px] sm:text-xs font-mono font-bold shrink-0">
                    <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" /> {t('achievements', 'offerReceived')}
                  </span>
                )}
              </div>

              {/* 1 OR 2 PHOTOS SHOWCASE BOX */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold block">
                  {t('achievements', 'photoShowcase')}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Photo 1: Student Photo */}
                  {activeStudent.studentPhoto ? (
                    <div className="relative group h-36 sm:h-40 rounded-2xl overflow-hidden border theme-border bg-black/40 shadow-md">
                      <img
                        src={activeStudent.studentPhoto}
                        alt={activeStudent.studentName}
                        decoding="async"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white">
                        <span className="text-[11px] font-serif font-bold truncate">
                          {activeStudent.studentName.split(' ')[0]} {activeStudent.studentName.split(' ')[1]}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/80 text-[9px] font-mono font-bold uppercase">
                          {t('achievements', 'enrolled')}
                        </span>
                      </div>
                    </div>
                  ) : null}

                  {/* Photo 2: University Campus Photo */}
                  <div className={`relative group h-36 sm:h-40 rounded-2xl overflow-hidden border theme-border bg-black/40 shadow-md ${!activeStudent.studentPhoto ? 'sm:col-span-2' : ''}`}>
                    <img
                      src={activeStudent.uniPhoto}
                      alt={activeStudent.university}
                      decoding="async"
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white">
                      <span className="text-[11px] font-mono font-semibold truncate text-white/90">
                        {activeStudent.shortName} Campus
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-sky-500/80 text-[9px] font-mono font-bold uppercase">
                        University
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student & Scholarship Information Details */}
              <div className="space-y-3 pt-2">
                <div className="p-3 sm:p-3.5 rounded-2xl theme-bg-page border theme-border space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase">
                    <User className="w-3.5 h-3.5" />
                    <span>{t('achievements', 'acceptedGrads')}</span>
                  </div>

                  {activeStudent.students ? (
                    <div className="space-y-1.5 pt-1">
                      {activeStudent.students.map((st, i) => (
                        <div key={i} className="flex items-center justify-between text-xs font-mono border-b theme-border pb-1 last:border-0 last:pb-0">
                          <span className="theme-text-primary font-medium truncate">{st.name}</span>
                          <span className="text-amber-400 font-bold shrink-0 ml-2">{st.grant}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm font-serif font-bold theme-text-primary">
                      {activeStudent.studentName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 sm:p-3 rounded-2xl theme-bg-page border theme-border space-y-1">
                    <span className="text-[10px] font-mono theme-text-secondary uppercase">{t('achievements', 'programMajor')}</span>
                    <p className="text-xs font-mono font-semibold theme-text-primary truncate">
                      {translations?.achievements?.majors?.[activeStudent.major] || activeStudent.major}
                    </p>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-2xl theme-bg-page border theme-border space-y-1">
                    <span className="text-[10px] font-mono theme-text-secondary uppercase">{t('achievements', 'grantAward')}</span>
                    <p className="text-xs font-mono font-bold text-amber-400 truncate">
                      {activeStudent.scholarship}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="space-y-5 py-2">
              <div className="flex items-center gap-3 pb-3 border-b theme-border">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold theme-text-primary">
                    Global Network Overview
                  </h3>
                  <p className="text-xs theme-text-secondary font-mono">
                    Xonqa tuman IM Acceptance & Enrollment Statistics
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl theme-bg-page border theme-border font-mono text-xs space-y-1">
                  <span className="text-[10px] theme-text-secondary uppercase">{t('achievements', 'destinations')}</span>
                  <p className="text-xl font-bold text-amber-400">6 Universities</p>
                </div>
                <div className="p-3.5 rounded-2xl theme-bg-page border theme-border font-mono text-xs space-y-1">
                  <span className="text-[10px] theme-text-secondary uppercase">{t('achievements', 'enrolledStudents')}</span>
                  <p className="text-xl font-bold text-emerald-400">1 Currently Enrolled</p>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Back / Next Controls */}
          <div className="pt-4 border-t theme-border flex items-center justify-between gap-4">
            <button
              onClick={handlePrev}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl theme-bg-page border theme-border hover:border-emerald-500/50 theme-text-primary text-xs font-mono font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              {t('achievements', 'back')}
            </button>

            <span className="text-xs font-mono theme-text-secondary">
              {currentIndex !== null ? `${currentIndex + 1} / ${ABROAD_STUDENTS.length}` : t('achievements', 'allPlaces')}
            </span>

            <button
              onClick={handleNext}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono font-bold flex items-center gap-1.5 sm:gap-2 transition-all shadow-md cursor-pointer group"
            >
              {t('achievements', 'next')}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
