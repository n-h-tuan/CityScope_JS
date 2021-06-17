import MenuContainer from './MenuContainer'
import MapContainer from './DeckglMap'
import LoadingSpinner from './CityIO/LoadingSpinner'
import VisContainer from './VisContainer/index_custom'
import {
  makeStyles,
  Grid,
  Card,
  CardContent,
  Container,
} from '@material-ui/core'
import Page from '../../layouts/Page'

import axios from "axios";
import { useEffect, useState } from "react";
import settings from "../../settings/settings.json";
import { useSelector, useDispatch } from "react-redux";
import { listenToMenuUI } from "../../redux/actions";
import ChooseScenario from "./MenuContainer/ChooseScenario"


const useStyles = makeStyles((theme) => ({
  root: {
    margin: 'auto',
    height: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3),
  },
}))

const getAPICall = async (URL) => {
  try {
    const response = await axios.get(URL);
    return response.data;
  } catch (err) {
    console.log(err);
  }
};

export default function CSjsMainCustom(props) {
  const classes = useStyles()
  const tableName = props.tableName
  const cityIOdata = props.cityIOdata
  const onlyMap = props.onlyMap
  const onlyOptionMenu = props.onlyOptionMenu
  const onlyChartSidebar = props.onlyChartSidebar
  const mapAndChartSidebar = props.mapAndChartSidebar

  const menuState = useSelector((state) => state.MENU);
  const loadedModules = Object.keys(cityIOdata);
  const togglesMeta = settings.menu.toggles;

  const dispatch = useDispatch();
  let myMenuState = [...menuState];
  const [chosenScenario, setChosenScenario] = useState("hcm_test_v1");
  let myChosenScenario = 'hcm_test_v1';

  /* Listening View Option Change */
  useEffect(() => {
    const timer = setTimeout(listenChangingOption, 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function listenChangingOption() {
    // recursively get hashes
    const options = await getAPICall(`${process.env.REACT_APP_EXPRESS_PUBLIC_URL}/get-option`);
    const scenarioObject = await getAPICall(`${process.env.REACT_APP_EXPRESS_PUBLIC_URL}/get-scenario`);
    if (options) {
      console.log(options);
      let table = options.table;
      let option = options.option;
      let mode = options.mode;
      if (table == tableName) {
        if (option) {
          let requireModule = togglesMeta[option].requireModule;
          if (loadedModules.includes(requireModule) || requireModule === false) {
            const i = myMenuState.indexOf(option);
            if (mode == "ON") {
              if (i === -1) {
                myMenuState.push(option);
              }
            }
            else {
              if (i !== -1) {
                myMenuState.splice(i, 1);
              }
            }
            dispatch(listenToMenuUI(myMenuState));
          }
        }
      }
    }
    if (scenarioObject) {
      console.log(scenarioObject);
      let scenario = scenarioObject.scenario;
      if (scenario && scenario != myChosenScenario) {
        console.log(111);
        myChosenScenario = scenario;
        setChosenScenario(scenario);
      }
    }
    setTimeout(listenChangingOption, 1000);
  }

  /* END Listening */

  return (
    <Page className={classes.root} title="CitySCopeJS">
      <LoadingSpinner />
      <Container maxWidth={null}>
        <Grid container spacing={5}>
          {onlyOptionMenu && <Grid item xs={12} l={12} md={12} xl={12} container>
            <Grid item container direction="column" spacing={2}>
              <Grid item xs={12} l={12} md={12} xl={12}>
                <Card
                  elevation={15}
                  style={{
                    maxHeight: '90vh',
                    overflow: 'auto',
                  }}
                >
                  <CardContent>
                    <MenuContainer tableName={tableName} />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>}

          {onlyMap && <Grid item xs={12} l={12} md={12} xl={12}>
            <Card
              elevation={15}
              style={{
                height: '90vh',
                width: '100%',
                position: 'relative',
              }}
            >
              {/* <Test/> */}
              <MapContainer onlyMap={true} />
            </Card>
          </Grid>}
          {mapAndChartSidebar && <Grid item xs={6} l={6} md={6} xl={6}>
            <Card
              elevation={15}
              style={{
                maxHeight: '100%',
                overflow: 'hidden',
              }}
            >
              <VisContainer cityIOdata={cityIOdata} />
            </Card>
          </Grid>}
          {mapAndChartSidebar && <Grid item xs={6} l={6} md={6} xl={6}>
            <Card
              elevation={15}
              style={{
                height: '90vh',
                width: '100%',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* <Test/> */}
              <MapContainer pitchMap={30} zoomMap={14} autoRotate={true}/>
            </Card>
          </Grid>}
          {/* {onlyChartSidebar && <Grid item xs={12} l={12} md={12} xl={12}>
            <Card
              elevation={15}
              style={{
                maxHeight: '90vh',
                overflow: 'auto',
              }}
            >
              <VisContainer cityIOdata={cityIOdata} />
            </Card>
          </Grid>} */}
          <Grid>
            <ChooseScenario chosenScenario={chosenScenario} />
          </Grid>
        </Grid>
      </Container>
    </Page>
  )
}
