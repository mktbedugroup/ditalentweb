
import React from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useI18n } from '../../contexts/I18nContext';

const TermsPage: React.FC = () => {
  const { t } = useI18n();
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-8 rounded-lg shadow-md prose lg:prose-xl prose-headings:text-primary prose-a:text-secondary">
                <h1>{t('legal.terms.title')}</h1>
                <p className="lead">Última actualización: 25 de Julio de 2024</p>

                <h2>1. Acuerdo de Términos</h2>
                <p>
                    Estos Términos y Condiciones constituyen un acuerdo legalmente vinculante hecho entre usted, ya sea personalmente o en nombre de una entidad ("usted") y Ditalent ("nosotros", "nos" o "nuestro"), con respecto a su acceso y uso del sitio web de Ditalent, así como cualquier otra forma de medio, canal de medios, sitio web móvil o aplicación móvil relacionada, vinculada o conectada de otra manera al mismo (colectivamente, el "Sitio").
                </p>
                
                <h2>2. Derechos de Propiedad Intelectual</h2>
                <p>
                    A menos que se indique lo contrario, el Sitio es de nuestra propiedad y todo el código fuente, bases de datos, funcionalidad, software, diseños de sitios web, audio, video, texto, fotografías y gráficos en el Sitio (colectivamente, el "Contenido") y las marcas comerciales, marcas de servicio y logotipos contenidos en él (las "Marcas") son de nuestra propiedad o están bajo nuestro control o licencia, y están protegidos por las leyes de derechos de autor y marcas registradas.
                </p>

                <h2>3. Representaciones del Usuario</h2>
                <p>
                    Al usar el Sitio, usted declara y garantiza que: (1) toda la información de registro que envíe será verdadera, precisa, actual y completa; (2) mantendrá la precisión de dicha información y la actualizará rápidamente según sea necesario; (3) tiene la capacidad legal y acepta cumplir con estos Términos y Condiciones; (4) no utilizará el Sitio para ningún propósito ilegal o no autorizado.
                </p>

                <h2>4. Actividades Prohibidas</h2>
                <p>
                    No puede acceder ni utilizar el Sitio para ningún otro propósito que no sea aquel para el que ponemos el Sitio a su disposición. El Sitio no puede ser utilizado en conexión con ningún esfuerzo comercial, excepto aquellos que están específicamente respaldados o aprobados por nosotros.
                </p>

                <h2>5. Terminación</h2>
                <p>
                    Nos reservamos el derecho de suspender o cancelar su cuenta y denegar cualquier uso actual o futuro del Sitio por cualquier motivo y en cualquier momento.
                </p>
                
                <h2>6. Ley Aplicable</h2>
                <p>
                    Estos Términos y Condiciones se regirán e interpretarán de acuerdo con las leyes de la República Dominicana.
                </p>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsPage;
