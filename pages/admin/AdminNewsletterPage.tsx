import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { NewsletterSubscriber } from '../../types';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'; // Import Quill's snow theme CSS

const AdminNewsletterPage: React.FC = () => {
    // State for subscribers list
    const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState<boolean>(false);

    // State for tabs
    const [activeTab, setActiveTab] = useState('subscribers');

    // State for campaign form
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sendSuccess, setSendSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (activeTab === 'subscribers') {
            const fetchSubscribers = async () => {
                try {
                    setLoading(true);
                    const data = await api.getNewsletterSubscribers();
                    setSubscribers(data);
                    setError(null);
                } catch (err) {
                    setError('Error al cargar los suscriptores. Por favor, intente de nuevo más tarde.');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchSubscribers();
        }
    }, [activeTab]);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const blob = await api.downloadNewsletterSubscribersExcel();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'newsletter_subscribers.xlsx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to export subscribers', err);
            setError('Error al exportar los suscriptores.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleSendCampaign = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        setSendSuccess(null);
        setError(null);

        try {
            const response = await api.sendNewsletterCampaign({ subject, content });
            setSendSuccess(response.message);
            setSubject('');
            setContent('');
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error al enviar la campaña.');
            console.error(err);
        } finally {
            setIsSending(false);
        }
    };

    const TabButton: React.FC<{ tabName: string; label: string }> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 
                ${activeTab === tabName 
                    ? 'bg-white text-primary-600 border-b-2 border-primary-600' 
                    : 'bg-transparent text-gray-500 hover:text-primary-600'}`}>
            {label}
        </button>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-4">
                    <TabButton tabName="subscribers" label="Suscriptores" />
                    <TabButton tabName="campaign" label="Crear Campaña" />
                </nav>
            </div>

            {activeTab === 'subscribers' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold">Lista de Suscriptores</h1>
                        <button
                            onClick={handleExport}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out disabled:bg-gray-400"
                            disabled={isExporting || subscribers.length === 0}>
                            {isExporting ? 'Exportando...' : 'Exportar a Excel'}
                        </button>
                    </div>
                    {loading && <p>Cargando suscriptores...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {!loading && !error && (
                        <div className="bg-white shadow-md rounded-lg overflow-hidden">
                           <table className="min-w-full leading-normal">
                                <thead>
                                    <tr>
                                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha de Suscripción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subscribers.length > 0 ? (
                                        subscribers.map((subscriber) => (
                                            <tr key={subscriber.id}>
                                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">{subscriber.email}</p></td>
                                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">{new Date(subscriber.subscribedAt).toLocaleString()}</p></td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={2} className="text-center py-10">No hay suscriptores todavía.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'campaign' && (
                <div>
                    <h1 className="text-3xl font-bold mb-6">Crear Campaña de Newsletter</h1>
                    <form onSubmit={handleSendCampaign} className="bg-white p-6 rounded-lg shadow-md">
                         {error && <p className="text-red-500 mb-4">{error}</p>}
                        {sendSuccess && <p className="text-green-500 mb-4">{sendSuccess}</p>}
                        <div className="mb-4">
                            <label htmlFor="subject" className="block text-gray-700 text-sm font-bold mb-2">Asunto</label>
                            <input
                                type="text"
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Contenido del Correo</label>
                            <div className="bg-white">
                                <ReactQuill theme="snow" value={content} onChange={setContent} />
                            </div>
                        </div>
                        <div className="flex items-center justify-end">
                            <button
                                type="submit"
                                className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:bg-gray-400"
                                disabled={isSending || !subject || !content}>
                                {isSending ? 'Enviando...' : 'Enviar a todos los suscriptores'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminNewsletterPage;
