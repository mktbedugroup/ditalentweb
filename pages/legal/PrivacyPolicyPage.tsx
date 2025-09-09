
import React from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useI18n } from '../../contexts/I18nContext';

const PrivacyPolicyPage: React.FC = () => {
  const { t } = useI18n();
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-8 rounded-lg shadow-md prose lg:prose-xl prose-headings:text-primary prose-a:text-secondary">
                <h1>{t('legal.privacy.title')}</h1>
                <p className="lead">Última actualización: 25 de Julio de 2024</p>

                <h2>1. Introducción</h2>
                <p>
                    Bienvenido a Ditalent. Nos comprometemos a proteger su privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y salvaguardamos su información cuando visita nuestro sitio web.
                </p>

                <h2>2. Recopilación de su Información</h2>
                <p>
                    Podemos recopilar información sobre usted de varias maneras. La información que podemos recopilar en el Sitio incluye:
                </p>
                <ul>
                    <li><strong>Datos Personales:</strong> Información de identificación personal, como su nombre, dirección de correo electrónico y número de teléfono, que usted nos proporciona voluntariamente cuando se registra en el Sitio o cuando elige participar en diversas actividades relacionadas con el Sitio.</li>
                    <li><strong>Datos de Perfil:</strong> Para los candidatos, podemos recopilar información profesional como su CV, historial laboral, educación, habilidades y otra información relevante para la búsqueda de empleo.</li>
                </ul>

                <h2>3. Uso de su Información</h2>
                <p>
                    Tener información precisa sobre usted nos permite brindarle una experiencia fluida, eficiente y personalizada. Específicamente, podemos usar la información recopilada sobre usted a través del Sitio para:
                </p>
                <ul>
                    <li>Crear y administrar su cuenta.</li>
                    <li>Conectar a candidatos con oportunidades de empleo en empresas clientes.</li>
                    <li>Enviarle notificaciones sobre vacantes que coincidan con su perfil.</li>
                    <li>Mejorar la eficiencia y el funcionamiento del Sitio.</li>
                </ul>

                <h2>4. Divulgación de su Información</h2>
                <p>
                    No compartiremos su información con terceros, excepto en las siguientes situaciones:
                </p>
                <ul>
                    <li><strong>Con su Consentimiento:</strong> Al postularse a una vacante, usted consiente que compartamos su perfil con la empresa empleadora.</li>
                    <li><strong>Por Ley o para Proteger Derechos:</strong> Si creemos que la divulgación de información sobre usted es necesaria para responder a un proceso legal, para investigar o remediar posibles violaciones de nuestras políticas.</li>
                </ul>
                
                <h2>5. Seguridad de su Información</h2>
                <p>
                    Utilizamos medidas de seguridad administrativas, técnicas y físicas para ayudar a proteger su información personal. Si bien hemos tomado medidas razonables para proteger la información personal que nos proporciona, tenga en cuenta que a pesar de nuestros esfuerzos, ninguna medida de seguridad es perfecta o impenetrable.
                </p>
                
                <h2>6. Contacto</h2>
                <p>
                    Si tiene preguntas o comentarios sobre esta Política de Privacidad, contáctenos en: <a href="mailto:legal@ditalent.com">legal@ditalent.com</a>.
                </p>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
