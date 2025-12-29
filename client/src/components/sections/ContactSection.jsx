import { useState } from "react";
import { Mail, Phone, MapPin, Check, MessageCircle } from "lucide-react";

export default function ContactSection({ accentColor = "#C0392B" }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      tempErrors.name = "Por favor, ingrese su nombre";
      isValid = false;
    }

    if (!formData.email.trim()) {
      tempErrors.email = "Por favor, ingrese su email";
      isValid = false;
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      tempErrors.email = "Dirección de email inválida";
      isValid = false;
    }

    if (!formData.message.trim()) {
      tempErrors.message = "Por favor, ingrese su mensaje";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleWhatsAppSend = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // +52 3326374701 (sin +, sin espacios) para wa.me
    const phoneE164 = "523326374701";

    const text = `Hola DPI, quiero ponerme en contacto.

Nombre: ${formData.name}
Email: ${formData.email}
Teléfono: ${formData.phone || "-"}
Empresa: ${formData.company || "-"}
Asunto: ${formData.subject || "-"}

Mensaje:
${formData.message}
`;

    const url = `https://wa.me/${phoneE164}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");

    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  const mapsQuery =
    "Av. de los Arcos 735, Jardines del Bosque, 44520 Guadalajara, Jal.";
  const mapsUrl =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(mapsQuery);

  return (
    <section
      id="contact"
      className="
        py-16 md:py-24 
        bg-[#F4F5F7] dark:bg-[#121212] 
        transition-colors duration-300
      "
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* TITLE */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-6">
          Contacto
        </h2>

        <div
          className="w-20 h-1.5 mx-auto mb-6"
          style={{ backgroundColor: accentColor }}
        />

        {/* INTRO */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Estamos listos para transformar sus ideas en proyectos exitosos.
            Contáctenos para discutir cómo podemos ayudarle a maximizar el valor
            de su inversión inmobiliaria.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* PANELS */}
          <div
            className="
              flex flex-col lg:flex-row 
              bg-white dark:bg-[#1E1E1E] 
              rounded-lg shadow-lg overflow-hidden 
              transition-colors duration-300
            "
          >
            {/* CONTACT INFO */}
            <div
              className="
                w-full lg:w-2/5 p-8 lg:p-12 
                text-gray-900 dark:text-white
              "
              style={{ backgroundColor: `${accentColor}08` }}
            >
              <h3 className="text-2xl font-semibold mb-8">
                Información de Contacto
              </h3>

              <div className="space-y-6">
                <InfoItem
                  icon={<Mail className="text-gray-800 dark:text-gray-200" />}
                  title="Correo Electrónico"
                  content={
                    <a href="mailto:dpimexico_planeacion@yahoo.com.mx">
                      dpimexico_planeacion@yahoo.com.mx
                    </a>
                  }
                  accentColor={accentColor}
                />

                <InfoItem
                  icon={<Phone className="text-gray-800 dark:text-gray-200" />}
                  title="Teléfono"
                  content={<a href="tel:+523336163987">+52 33 3616 3987</a>}
                  accentColor={accentColor}
                />

                <InfoItem
                  icon={<MapPin className="text-gray-800 dark:text-gray-200" />}
                  title="Ubicación"
                  content={
                    <>
                      Av. de los Arcos 735<br />
                      Jardines del Bosque, 44520<br />
                      Guadalajara, Jal.
                    </>
                  }
                  accentColor={accentColor}
                />
              </div>

              {/* SMALL MAP UNDER LOCATION + CLICKABLE */}
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="block mt-6 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700"
                title="Abrir en Google Maps"
              >
                <div className="h-40 w-full relative">
                  <iframe
                    title="Mapa DPI Guadalajara"
                    src="https://www.google.com/maps?q=Av.%20de%20los%20Arcos%20735,%20Jardines%20del%20Bosque,%20Guadalajara,%20Jal.&output=embed"
                    className="w-full h-full border-0 pointer-events-none"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="absolute bottom-2 right-2 bg-white/90 dark:bg-black/70 text-xs px-2 py-1 rounded">
                    Abrir en Google Maps
                  </div>
                </div>
              </a>
            </div>

            {/* FORM */}
            <div className="w-full lg:w-3/5 p-8 lg:p-12 text-gray-900 dark:text-white">
              <h3 className="text-2xl font-semibold mb-8">Envíenos un Mensaje</h3>

              {submitSuccess && (
                <div
                  className="
                    mb-8 
                    bg-green-50 dark:bg-green-900/30 
                    border border-green-200 dark:border-green-700 
                    text-green-800 dark:text-green-300 
                    rounded-lg p-4 flex items-center
                  "
                >
                  <Check className="mr-2" />
                  Se abrió WhatsApp con su mensaje listo para enviar.
                </div>
              )}

              <form onSubmit={handleWhatsAppSend}>
                <FormFields
                  formData={formData}
                  errors={errors}
                  handleChange={handleChange}
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="
                      inline-flex items-center px-6 py-3 rounded-md text-white 
                      hover:brightness-110 transition-all
                    "
                    style={{ backgroundColor: "#25D366" }}
                  >
                    <MessageCircle className="mr-2" />
                    Enviar por WhatsApp
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- HELPERS WITH DARK MODE ---------- */

function InfoItem({ icon, title, content, accentColor }) {
  return (
    <div className="flex items-start">
      <div
        className="
          w-10 h-10 rounded-full flex items-center justify-center 
          bg-gray-100 dark:bg-[#2A2A2A]
          transition-colors duration-300
        "
        style={{ border: `1px solid ${accentColor}40` }}
      >
        {icon}
      </div>
      <div className="ml-4">
        <h4 className="font-medium dark:text-white">{title}</h4>
        <div className="text-gray-600 dark:text-gray-300">{content}</div>
      </div>
    </div>
  );
}

function FormFields({ formData, errors, handleChange }) {
  const field = (name, type = "text", placeholder = "") => (
    <div>
      <input
        name={name}
        type={type}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className={`
          w-full px-4 py-2 border rounded-md 
          bg-white dark:bg-[#2A2A2A] 
          text-gray-900 dark:text-gray-200
          transition-colors duration-300
          ${errors[name] ? "border-red-500" : "border-gray-300 dark:border-gray-600"}
        `}
      />
      {errors[name] && (
        <p className="text-red-500 dark:text-red-400 text-xs mt-1">
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {field("name", "text", "Nombre completo *")}
        {field("email", "email", "Correo electrónico *")}
        {field("phone", "tel", "Teléfono")}
        {field("company", "text", "Empresa")}
      </div>

      {field("subject", "text", "Asunto")}

      <div className="mt-6">
        <textarea
          name="message"
          rows={5}
          value={formData.message}
          onChange={handleChange}
          placeholder="Mensaje *"
          className={`
            w-full px-4 py-2 border rounded-md 
            bg-white dark:bg-[#2A2A2A] 
            text-gray-900 dark:text-gray-200
            transition-colors duration-300
            ${errors.message ? "border-red-500" : "border-gray-300 dark:border-gray-600"}
          `}
        />
        {errors.message && (
          <p className="text-red-500 dark:text-red-400 text-xs mt-1">
            {errors.message}
          </p>
        )}
      </div>
    </>
  );
}
