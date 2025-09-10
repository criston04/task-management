'use client';
import { useState } from 'react';

interface Contact {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
}

export default function PhoneBook() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [formData, setFormData] = useState({
    nombre: 'Codificador',
    apellido: '',
    telefono: ''
  });
  const [errors, setErrors] = useState({
    nombre: '',
    apellido: '',
    telefono: ''
  });

  const validateForm = () => {
    const newErrors = {
      nombre: '',
      apellido: '',
      telefono: ''
    };

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es obligatorio';
    }
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El número de teléfono es obligatorio';
    }

    setErrors(newErrors);
    return !newErrors.nombre && !newErrors.apellido && !newErrors.telefono;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const newContact: Contact = {
      id: Date.now().toString(),
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      telefono: formData.telefono.trim()
    };

    setContacts(prevContacts => {
      const updatedContacts = [...prevContacts, newContact];
      // Sort by apellido (last name) alphabetically
      return updatedContacts.sort((a, b) => a.apellido.localeCompare(b.apellido));
    });

    // Reset form but keep "Codificador" in name field
    setFormData({
      nombre: 'Codificador',
      apellido: '',
      telefono: ''
    });
    setErrors({
      nombre: '',
      apellido: '',
      telefono: ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Guía Telefónica
        </h1>
        
        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Agregar Nuevo Contacto
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 ${
                  errors.nombre ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ingrese el nombre"
              />
              {errors.nombre && (
                <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
              )}
            </div>

            <div>
              <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-1">
                Apellido *
              </label>
              <input
                type="text"
                id="apellido"
                value={formData.apellido}
                onChange={(e) => handleInputChange('apellido', e.target.value)}
                className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 ${
                  errors.apellido ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ingrese el apellido"
              />
              {errors.apellido && (
                <p className="text-red-500 text-sm mt-1">{errors.apellido}</p>
              )}
            </div>

            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                Número de Teléfono *
              </label>
              <input
                type="tel"
                id="telefono"
                value={formData.telefono}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
                className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 ${
                  errors.telefono ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ingrese el número de teléfono"
              />
              {errors.telefono && (
                <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200"
            >
              Agregar Contacto
            </button>
          </form>
        </div>

        {/* Lista de Contactos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Lista de Contactos ({contacts.length})
          </h2>
          
          {contacts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay contactos agregados. ¡Agrega el primero!
            </p>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-800">
                        {contact.nombre} {contact.apellido}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        <span className="font-medium">Teléfono:</span> {contact.telefono}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Información de ordenamiento */}
        {contacts.length > 0 && (
          <p className="text-sm text-gray-500 text-center mt-4">
            Los contactos se ordenan automáticamente por apellido
          </p>
        )}
      </div>
    </div>
  );
}