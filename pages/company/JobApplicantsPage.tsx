import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import type { Application, CandidateProfile, Job } from '../../types';
import * as ReactRouterDOM from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from '@hello-pangea/dnd';
import { useI18n } from '../../contexts/I18nContext';
import { ApplicantCard } from '../../components/applicants/ApplicantCard';

// A type for our columns state
interface Column {
    id: Application['status'];
    title: string;
    applicantIds: string[];
}

interface Columns {
    [key: string]: Column;
}

const JobApplicantsPage: React.FC = () => {
    const { jobId } = ReactRouterDOM.useParams<{ jobId: string }>();
    const { t } = useI18n();

    const [job, setJob] = useState<Job | null>(null);
    const [applicants, setApplicants] = useState<Record<string, Application>>({});
    const [profiles, setProfiles] = useState<Record<string, CandidateProfile>>({});
    const [columns, setColumns] = useState<Columns>({});
    const [columnOrder, setColumnOrder] = useState<Application['status'][]>(['Submitted', 'In Review', 'Interviewing', 'Hired', 'Rejected']);
    const [loading, setLoading] = useState(true);

    const fetchApplicants = useCallback(async () => {
        if (!jobId) return;
        setLoading(true);
        try {
            const [jobData, applicantsData] = await Promise.all([
                api.getJobById(jobId),
                api.getApplicantsByJobId(jobId)
            ]);
            setJob(jobData || null);

            const profilesData = await Promise.all(applicantsData.map(app => api.getProfileById(app.profileId)));

            const newApplicants: Record<string, Application> = {};
            const newProfiles: Record<string, CandidateProfile> = {};
            const newColumns: Columns = {
                'Submitted': { id: 'Submitted', title: t('status.Submitted'), applicantIds: [] },
                'In Review': { id: 'In Review', title: t('status.In Review'), applicantIds: [] },
                'Interviewing': { id: 'Interviewing', title: t('status.Interviewing'), applicantIds: [] },
                'Hired': { id: 'Hired', title: t('status.Hired'), applicantIds: [] },
                'Rejected': { id: 'Rejected', title: t('status.Rejected'), applicantIds: [] },
            };

            applicantsData.forEach((app, index) => {
                newApplicants[app.id] = app;
                const profile = profilesData[index];
                if (profile) {
                    newProfiles[app.profileId] = profile;
                }
                // Ensure status is valid and column exists
                const status = app.status as Application['status'];
                if (newColumns[status]) {
                    newColumns[status].applicantIds.push(app.id);
                } else {
                    // Fallback for unknown statuses
                    newColumns['Submitted'].applicantIds.push(app.id);
                }
            });

            setApplicants(newApplicants);
            setProfiles(newProfiles);
            setColumns(newColumns);

        } catch (error) {
            console.error("Failed to fetch applicants", error);
        } finally {
            setLoading(false);
        }
    }, [jobId, t]);

    useEffect(() => {
        fetchApplicants();
    }, [fetchApplicants]);

    const onDragEnd: OnDragEndResponder = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const startColumn = columns[source.droppableId];
        const endColumn = columns[destination.droppableId];

        // Keep a copy of the original state to revert on API error
        const originalColumns = { ...columns };

        if (startColumn === endColumn) {
            const newApplicantIds = Array.from(startColumn.applicantIds);
            newApplicantIds.splice(source.index, 1);
            newApplicantIds.splice(destination.index, 0, draggableId);

            const newColumn = { ...startColumn, applicantIds: newApplicantIds };
            const newColumnsState = { ...columns, [newColumn.id]: newColumn };
            setColumns(newColumnsState);
        } else {
            // Moving to a different column
            const startApplicantIds = Array.from(startColumn.applicantIds);
            startApplicantIds.splice(source.index, 1);
            const newStartColumn = { ...startColumn, applicantIds: startApplicantIds };

            const endApplicantIds = Array.from(endColumn.applicantIds);
            endApplicantIds.splice(destination.index, 0, draggableId);
            const newEndColumn = { ...endColumn, applicantIds: endApplicantIds };

            // Optimistic UI update
            const newColumnsState = {
                ...columns,
                [newStartColumn.id]: newStartColumn,
                [newEndColumn.id]: newEndColumn,
            };
            setColumns(newColumnsState);

            // API call to persist the change
            try {
                console.log(`[Kanban] Attempting to move application ${draggableId} to status ${destination.droppableId}`);
                await api.updateApplicationStatus(draggableId, destination.droppableId as Application['status']);
                console.log(`[Kanban] Successfully updated status for ${draggableId}`);
            } catch (error) {
                console.error("[Kanban] Failed to update application status. Reverting UI.", error);
                // Revert state on error
                setColumns(originalColumns);
            }
        }
    };

    if (loading) return <p>{t('company.applicants.loading')}</p>;
    if (!job) return <p>{t('company.applicants.notFound')}</p>;

    return (
        <div>
            <ReactRouterDOM.Link to="/company/jobs" className="text-primary hover:underline mb-4 inline-block">&larr; {t('company.applicants.back')}</ReactRouterDOM.Link>
            <h1 className="text-3xl font-bold text-gray-800">{t('company.applicants.kanbanTitle')}</h1>
            <p className="text-gray-600 mb-6">{t('company.applicants.title')} {job.title.es}</p>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
                    {columnOrder.map(columnId => {
                        const column = columns[columnId];
                        if (!column) return null; // Safeguard if a column is unexpectedly missing
                        const columnApplicants = column.applicantIds.map(appId => applicants[appId]);

                        return (
                            <Droppable key={column.id} droppableId={column.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`p-3 rounded-lg bg-gray-100 transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-primary/10' : ''}`}
                                    >
                                        <h3 className="font-bold text-gray-700 pb-2 border-b mb-4 flex justify-between items-center text-sm uppercase tracking-wider">
                                            {column.title}
                                            <span className="bg-gray-200 text-gray-600 text-xs font-semibold px-2 py-1 rounded-full">{column.applicantIds.length}</span>
                                        </h3>
                                        <div className="min-h-[600px] space-y-3">
                                            {columnApplicants.map((app, index) => {
                                                if (!app) return null; // Safeguard if an applicant is unexpectedly missing
                                                const profile = profiles[app.profileId];
                                                if (!profile) return null;
                                                return (
                                                    <Draggable key={app.id} draggableId={app.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`shadow-sm ${snapshot.isDragging ? 'ring-2 ring-primary' : ''}`}
                                                            >
                                                                <ApplicantCard application={app} profile={profile} linkPrefix="/company" />
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                );
                                            })}
                                            {provided.placeholder}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        );
                    })}
                </div>
            </DragDropContext>
        </div>
    );
};

export default JobApplicantsPage;
