import React from 'react';
import type { CandidateProfile } from '../../types';
import { Card } from '../common/Card';
import { useI18n } from '../../contexts/I18nContext';

interface ProfileCompletenessProps {
  profile: CandidateProfile;
}

const MIN_SUMMARY_LENGTH = 150;

const ProfileCompleteness: React.FC<ProfileCompletenessProps> = ({ profile }) => {
  const { t, t_dynamic } = useI18n();

  const calculateCompleteness = () => {
    const tips: string[] = [];
    let score = 0;
    const criteria = 8;
    const pointsPerCriterion = 100 / criteria;

    // 1. Photo
    if (profile.photoUrl && !profile.photoUrl.includes('pravatar.cc')) {
      score += pointsPerCriterion;
    } else {
      tips.push(t('candidate.profile.completeness.tips.addPhoto'));
    }

    // 2. Headline
    if (t_dynamic(profile.headline).trim().length > 0) {
      score += pointsPerCriterion;
    } else {
      tips.push(t('candidate.profile.completeness.tips.addHeadline'));
    }

    // 3. Summary
    if (t_dynamic(profile.summary).trim().length >= MIN_SUMMARY_LENGTH) {
      score += pointsPerCriterion;
    } else {
      tips.push(t('candidate.profile.completeness.tips.expandSummary'));
    }
    
    // 4. Work Experience
    if (profile.workLife && profile.workLife.length > 0) {
        score += pointsPerCriterion;
    } else {
        tips.push(t('candidate.profile.completeness.tips.addWorkExperience'));
    }

    // 5. Education
    if (profile.academicLife && profile.academicLife.length > 0) {
        score += pointsPerCriterion;
    } else {
        tips.push(t('candidate.profile.completeness.tips.addEducation'));
    }

    // 6. Skills
    if (profile.skills && profile.skills.length > 0) {
        score += pointsPerCriterion;
    } else {
        tips.push(t('candidate.profile.completeness.tips.addSkills'));
    }

    // 7. Languages
    if (profile.languages && profile.languages.length > 0) {
        score += pointsPerCriterion;
    } else {
        tips.push(t('candidate.profile.completeness.tips.addLanguages'));
    }

    // 8. Social Links
    if (profile.socialLinks && profile.socialLinks.length > 0) {
        score += pointsPerCriterion;
    } else {
        tips.push(t('candidate.profile.completeness.tips.addSocialLinks'));
    }

    return {
      percentage: Math.round(score),
      tips,
    };
  };

  const { percentage, tips } = calculateCompleteness();

  const getStatusColor = () => {
    if (percentage < 40) return 'text-red-500';
    if (percentage < 75) return 'text-yellow-500';
    return 'text-green-500';
  };
  
  const getProgressBarColor = () => {
    if (percentage < 40) return 'bg-red-500';
    if (percentage < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  return (
    <Card className="mb-6">
        <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800">{t('candidate.profile.completeness.title')}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('candidate.profile.completeness.subtitle')}</p>
            
            <div className="flex items-center gap-4">
                <div className={`text-4xl font-bold ${getStatusColor()}`}>{percentage}%</div>
                <div className="flex-grow">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            className={`h-2.5 rounded-full ${getProgressBarColor()}`}
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {tips.length > 0 && (
                 <div className="mt-4">
                    <h4 className="font-semibold text-gray-700">{t('candidate.profile.completeness.howToImprove')}</h4>
                    <ul className="list-disc list-inside mt-2 text-sm text-gray-600 space-y-1">
                        {tips.map((tip, index) => <li key={index}>{tip}</li>)}
                    </ul>
                </div>
            )}
        </div>
    </Card>
  );
};

export default ProfileCompleteness;
