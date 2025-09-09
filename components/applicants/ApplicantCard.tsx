import React from 'react';
import type { Application, CandidateProfile } from '../../types';
import { Card } from '../common/Card';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { useI18n } from '../../contexts/I18nContext';

interface ApplicantCardProps {
  application: Application;
  profile: CandidateProfile;
  linkPrefix: '/company' | '/admin';
}

export const ApplicantCard: React.FC<ApplicantCardProps> = ({ application, profile, linkPrefix }) => {
  const { t_dynamic } = useI18n();

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('applicationId', application.id);
  };

  return (
    <Card
      className="p-3 mb-3 cursor-grab bg-white shadow-sm hover:shadow-md active:cursor-grabbing"
      draggable
      onDragStart={handleDragStart}
    >
      <div className="flex items-center space-x-3">
        <img src={profile.photoUrl} alt={profile.fullName} className="w-12 h-12 rounded-full object-cover" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 truncate">{profile.fullName}</p>
          <p className="text-sm text-gray-500 truncate">{t_dynamic(profile.headline)}</p>
        </div>
      </div>
       <div className="mt-3 pt-2 border-t flex justify-end">
        <Link to={`${linkPrefix}/applicants/${profile.id}/profile`}>
          <Button variant="light" size="sm">View</Button>
        </Link>
      </div>
    </Card>
  );
};
