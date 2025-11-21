// src/components/dashboard/Sidebar.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import { IoHomeOutline, IoPeopleOutline, IoStatsChartOutline, IoNotificationsOutline, IoCloseOutline } from "react-icons/io5";
import { FaGraduationCap } from "react-icons/fa";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ===== Logo (birrete) ===== */
const AppLogo: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div
    className={`grid place-items-center rounded-2xl bg-gradient-to-b from-[#2e5bff] to-[#3fa2ff] shadow-sm ${className}`}
    style={{ width: 44, height: 44 }}
  >
    <FaGraduationCap className="text-white text-xl" />
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Overlay para cerrar sidebar en móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-60 bg-white border-r border-gray-200 fixed left-0 top-0 h-full z-50 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Botón cerrar en móvil */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <IoCloseOutline className="text-2xl text-gray-600" />
        </button>

        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <AppLogo />
            <div>
              <div className="text-base font-bold text-gray-900">EduExce</div>
              <div className="text-xs text-gray-900">Dashboard Institucional</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 mt-6 space-y-1">
          <NavLink to="" end className="block" onClick={onClose}>
            {({ isActive }) => (
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-[#e0f2fe] font-semibold"
                  : "hover:bg-gray-50"
              }`}>
                <IoHomeOutline style={{ 
                  color: isActive ? "#2563eb" : "#4b5563",
                  fontSize: '20px'
                }} />
                <span style={{ 
                  color: isActive ? "#2563eb" : "#4b5563",
                  fontSize: '15px'
                }}>
                  Inicio
                </span>
              </div>
            )}
          </NavLink>

          <NavLink to="estudiantes" className="block" onClick={onClose}>
            {({ isActive }) => (
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-[#e0f2fe] font-semibold"
                  : "hover:bg-gray-50"
              }`}>
                <IoPeopleOutline style={{ 
                  color: isActive ? "#2563eb" : "#4b5563",
                  fontSize: '20px'
                }} />
                <span style={{ 
                  color: isActive ? "#2563eb" : "#4b5563",
                  fontSize: '15px'
                }}>
                  Estudiantes
                </span>
              </div>
            )}
          </NavLink>

          <NavLink to="seguimiento" className="block" onClick={onClose}>
            {({ isActive }) => (
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-[#e0f2fe] font-semibold"
                  : "hover:bg-gray-50"
              }`}>
                <IoStatsChartOutline style={{ 
                  color: isActive ? "#2563eb" : "#4b5563",
                  fontSize: '20px'
                }} />
                <span style={{ 
                  color: isActive ? "#2563eb" : "#4b5563",
                  fontSize: '15px'
                }}>
                  Seguimiento
                </span>
              </div>
            )}
          </NavLink>

          <NavLink to="notificaciones" className="block" onClick={onClose}>
            {({ isActive }) => (
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-[#e0f2fe] font-semibold"
                  : "hover:bg-gray-50"
              }`}>
                <IoNotificationsOutline style={{ 
                  color: isActive ? "#2563eb" : "#4b5563",
                  fontSize: '20px'
                }} />
                <span style={{ 
                  color: isActive ? "#2563eb" : "#4b5563",
                  fontSize: '15px'
                }}>
                  Notificaciones
                </span>
              </div>
            )}
          </NavLink>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
