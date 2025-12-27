import { useState } from "react";
import { Mail, Phone, MapPin, Send, Check } from "lucide-react";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitSuccess(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          subject: "",
          message: "",
        });

        setTimeout(() => setSubmitSuccess(false), 5000);
      }, 1500);
    }
  };

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
          <div className="
            flex flex-col lg:flex-row 
            bg-white dark:bg-[#1E1E1E] 
            rounded-lg shadow-lg overflow-hidden 
            transition-colors duration-300
          ">
            
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
                  content={<a href="mailto:contacto@dpi.mx">contacto@dpi.mx</a>}
                  accentColor={accentColor}
                />

                <InfoItem
                  icon={<Phone className="text-gray-800 dark:text-gray-200" />}
                  title="Teléfono"
                  content={<a href="tel:+525512345678">+52 55 1234 5678</a>}
                  accentColor={accentColor}
                />

                <InfoItem
                  icon={<MapPin className="text-gray-800 dark:text-gray-200" />}
                  title="Ubicación"
                  content={
                    <>
                      Av. Reforma 222, Piso 15<br />
                      Col. Juárez, 06600<br />
                      Ciudad de México, México
                    </>
                  }
                  accentColor={accentColor}
                />
              </div>
            </div>

            {/* FORM */}
            <div className="w-full lg:w-3/5 p-8 lg:p-12 text-gray-900 dark:text-white">
              <h3 className="text-2xl font-semibold mb-8">
                Envíenos un Mensaje
              </h3>

              {submitSuccess && (
                <div className="
                  mb-8 
                  bg-green-50 dark:bg-green-900/30 
                  border border-green-200 dark:border-green-700 
                  text-green-800 dark:text-green-300 
                  rounded-lg p-4 flex items-center
                ">
                  <Check className="mr-2" />
                  ¡Gracias por contactarnos!
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <FormFields
                  formData={formData}
                  errors={errors}
                  handleChange={handleChange}
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="
                      inline-flex items-center px-6 py-3 rounded-md text-white 
                      hover:brightness-110 transition-all
                    "
                    style={{ backgroundColor: accentColor }}
                  >
                    {isSubmitting ? (
                      "Enviando..."
                    ) : (
                      <>
                        <Send className="mr-2" /> Enviar
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* MAP */}
          <div className="
            w-full h-80 md:h-[420px] 
            rounded-xl overflow-hidden shadow-lg 
            mt-10 bg-gray-200 dark:bg-[#1E1E1E]
            transition-colors duration-300
          ">
            <iframe
              title="Ubicación DPI Guadalajara"
              src="https://www.google.com/maps?q=Av.%20de%20los%20Arcos%20735,%20Jardines%20del%20Bosque,%20Guadalajara,%20Jal.&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
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
