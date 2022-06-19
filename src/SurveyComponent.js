import React from 'react';
import { makeStyles } from 'tss-react/mui';
import SurveyOverview from './SurveyOverview';
import SurveyEdit from './SurveyEdit';
import {ManagementViewTypes} from './Constants'

const useStyles = makeStyles()((theme) => ({
    root: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      justifyContent: 'space-between',
    }
}));

export default function SurveyComponent() {

    const { classes } = useStyles();

    const [state, setState] = React.useState({
        view: ManagementViewTypes.SURVEY_OVERVIEW,
        surveyId: null,
    });

    const updateView = (data) => {

        const newView = data.view || ManagementViewTypes.SURVEY_OVERVIEW;
        setState({...state,
            view: newView,
            surveyId: data.surveyId
        });
    };

    return (
        <div className={classes.root}>
            {state.view === ManagementViewTypes.SURVEY_OVERVIEW &&
                <SurveyOverview callback={updateView}/>
            }
            {state.view === ManagementViewTypes.SURVEY_EDIT &&
                <SurveyEdit callback={updateView} surveyId={state.surveyId}/>
            }
        </div>
    );
}