import React from 'react';
import SurveyOverview from './SurveyOverview';
import SurveyEdit from './SurveyEdit';
import { ManagementViewTypes } from './Constants'
import { Root } from './Styles';

export default function SurveyComponent() {

    const [state, setState] = React.useState({
        view: ManagementViewTypes.SURVEY_OVERVIEW,
        surveyId: null,
    });

    const updateView = (data) => {

        const newView = data.view || ManagementViewTypes.SURVEY_OVERVIEW;
        setState({
            ...state,
            view: newView,
            surveyId: data.surveyId
        });
    };

    return (
        <Root>
            {state.view === ManagementViewTypes.SURVEY_OVERVIEW &&
                <SurveyOverview callback={updateView} />
            }
            {state.view === ManagementViewTypes.SURVEY_EDIT &&
                <SurveyEdit callback={updateView} surveyId={state.surveyId} />
            }
        </Root>
    );
}