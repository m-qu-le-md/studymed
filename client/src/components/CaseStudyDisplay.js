import React from 'react';
import { useDevice } from '../hooks/useDevice';
import CaseStudyDesktop from './CaseStudyDesktop';
import CaseStudyMobile from './CaseStudyMobile';

const CaseStudyDisplay = (props) => {
  const { isMobile } = useDevice();

  return isMobile ? (
    <CaseStudyMobile {...props} />
  ) : (
    <CaseStudyDesktop {...props} />
  );
};

export default CaseStudyDisplay;