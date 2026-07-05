import React from 'react';
import { useDevice } from '../hooks/useDevice';
import QuestionSingleDesktop from './QuestionSingleDesktop';
import QuestionSingleMobile from './QuestionSingleMobile';

function QuestionSingleDisplay(props) {
  const { isMobile } = useDevice();

  if (isMobile) {
    return <QuestionSingleMobile {...props} />;
  }

  return <QuestionSingleDesktop {...props} />;
}

export default QuestionSingleDisplay;