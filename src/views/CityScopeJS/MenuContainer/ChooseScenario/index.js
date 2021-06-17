import React, { useEffect } from "react";
import settings from "../../../../settings/settings.json";
import gridSetting from "../../../../settings/GridEditorSettings.json"
import { FormControl, FormLabel, FormControlLabel, RadioGroup, Radio, CircularProgress, Stepper, Step, StepLabel, StepButton } from "@material-ui/core";
import { useState } from "react";
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import scenario1 from '../../../../settings/LandUse_0.json'
import scenario2 from '../../../../settings/LandUse_2.json'
import {
    getCityioData,
    setReadyState,
    setLoadingState,
    setScenarioNames,
    addLoadingModules,
    removeLoadingModules,
} from "../../../../redux/actions";

const getAPICall = async (URL) => {
    try {
        // ! should add 'retry' here
        // ! https://stackoverflow.com/questions/56074531/how-to-retry-5xx-requests-using-axios
        const response = await axios.get(URL);
        return response.data;
    } catch (err) {
        console.log(err);
    }
};

const makeGEOGRIDDATAobject = (geoJsonFeatures) => {
    let GEOGRIDDATA_object = []
    geoJsonFeatures.forEach((element) => {
        GEOGRIDDATA_object.push(element.properties)
    })
    return GEOGRIDDATA_object
}

const makeGEOGRIDobject = (struct, typesList, geoJsonFeatures, gridProps) => {
    let GEOGRID_object = struct

    // take types list and prepare to csJS format
    let newTypesList = {}

    typesList.forEach((oldType) => {
        newTypesList[oldType.name] = oldType
        //material-table creates strings for these items
        // so in first "Commit to cityIO", these must be turned into
        // Json objects. On Second commit, these are already objects,
        // hence the two conditions below

        newTypesList[oldType.name].LBCS =
            typeof oldType.LBCS == 'string' ? JSON.parse(oldType.LBCS) : oldType.LBCS
        newTypesList[oldType.name].NAICS =
            typeof oldType.NAICS == 'string'
                ? JSON.parse(oldType.NAICS)
                : oldType.NAICS
    })

    GEOGRID_object.properties.types = newTypesList

    // inject table props to grid
    GEOGRID_object.properties.header = gridProps
    GEOGRID_object.properties.header.longitude = parseFloat(
        GEOGRID_object.properties.header.longitude,
    )
    GEOGRID_object.properties.header.latitude = parseFloat(
        GEOGRID_object.properties.header.latitude,
    )
    GEOGRID_object.properties.header.rotation = parseFloat(
        GEOGRID_object.properties.header.rotation,
    )
    GEOGRID_object.properties.header.nrows = parseFloat(
        GEOGRID_object.properties.header.nrows,
    )
    GEOGRID_object.properties.header.ncols = parseFloat(
        GEOGRID_object.properties.header.ncols,
    )
    GEOGRID_object.properties.header.cellSize = parseFloat(
        GEOGRID_object.properties.header.cellSize,
    )

    // lastly get the grid features
    GEOGRID_object.features = geoJsonFeatures
    return GEOGRID_object
}

const postGridToCityIO = async (myTypeList, myGeoJsonFeatures) => {
    let GEOGRIDstruct = gridSetting.GEOGRID
    let typesList = myTypeList;
    // let geoJsonFeatures = reduxState.GRID_CREATED.features
    let geoJsonFeatures = myGeoJsonFeatures
    let gridProps = gridSetting.GEOGRID.properties.header
    gridProps.tableName = gridSetting.map.projectName;

    // take grid struct from settings
    // console.log('GEOGRIDstruct', GEOGRIDstruct);
    // console.log('typesList', typesList);
    // console.log('geoJsonFeatures', geoJsonFeatures);
    // console.log('gridProps', gridProps);
    let GEOGRID_object = makeGEOGRIDobject(
        GEOGRIDstruct,
        typesList,
        geoJsonFeatures,
        gridProps,
    )
    console.log('GEOGRID_object', GEOGRID_object);

    let GEOGRIDDATA_object = makeGEOGRIDDATAobject(geoJsonFeatures)
    let tableName = GEOGRID_object.properties.header.tableName.toLowerCase()

    const geoGridOptions = (URL, DATA) => {
        return {
            method: 'post',
            url: URL,
            data: DATA,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        }
    }

    const table_url = `${settings.cityIO.baseURL}${tableName}/`
    const new_table_grid = {
        GEOGRID: GEOGRID_object,
        GEOGRIDDATA: GEOGRIDDATA_object,
    }
    let response = await axios(geoGridOptions(table_url, new_table_grid));
    return response.data;
}

const createtypesArray = (LanduseTypesList) => {
    let typesArray = []
    Object.keys(LanduseTypesList).forEach((type) => {
        typesArray.push({
            name: type,
            description: 'description for: ' + type,
            color: LanduseTypesList[type].color,
            height: LanduseTypesList[type].height
                ? LanduseTypesList[type].height
                : 0,

            LBCS: LanduseTypesList[type].LBCS
                ? JSON.stringify(LanduseTypesList[type].LBCS)
                : null,
            NAICS: LanduseTypesList[type].NAICS
                ? JSON.stringify(LanduseTypesList[type].NAICS)
                : null,
            interactive: LanduseTypesList[type].interactive
                ? LanduseTypesList[type].interactive
                : "web",
            TypeCode: LanduseTypesList[type].TypeCode
                ? LanduseTypesList[type].TypeCode
                : null,
            IDSColor: LanduseTypesList[type].IDSColor
                ? LanduseTypesList[type].IDSColor
                : null,
            RGB: LanduseTypesList[type].RGB
                ? LanduseTypesList[type].RGB
                : null,
        })
    })
    return typesArray
}

function getSteps() {
    return ["2021", "2030"];
}

function ChooseScenario(props) {
    const chosenScenario = props.chosenScenario;
    const displayUI = props.displayUI;
    const [radioValue, setRadioValue] = useState('scenario1');
    const [loading, setLoading] = useState(false);
    // const reduxState = useSelector((state) => state)
    // console.log(reduxState.TYPES_LIST);

    useEffect(() => {
        async function autoChangeScenario() {
            await getModules(chosenScenario);
        }
        autoChangeScenario();
    }, [chosenScenario]);

    const handleRadioChange = async (event) => {
        let myChosenScenario = event.target.value
        let fileScenario = null;
        setRadioValue(myChosenScenario);
        switch (myChosenScenario) {
            case 'scenario1':
                fileScenario = scenario1;
                break;
            case 'scenario2':
                fileScenario = scenario2;
                break;
        }
        let geoJsonFeatures = fileScenario.features;
        let typesList = createtypesArray(gridSetting.GEOGRID.properties.types);
        setLoading(true);
        await postGridToCityIO(typesList, geoJsonFeatures);
        setLoading(false);
    }

    /* ONLY GETTING DATA */
    const [hashes, setHashes] = useState({});
    const cityioData = useSelector((state) => state.CITYIO);

    const dispatch = useDispatch();

    const [activeStep, setActiveStep] = useState(0);
    const steps = getSteps();

    async function getModules(tableName) {
        let cityioURL = `${settings.cityIO.baseURL}${tableName}/`;
        const newHashes = await getAPICall(cityioURL + "meta/hashes/");
        const promises = [];
        const loadingModules = [];
        const pickedModules = settings.cityIO.cityIOmodules.map((x) => x.name);
        // for each of the modules in settings, add api call to promises
        pickedModules.forEach((module) => {
            if (hashes[module] !== newHashes[module]) {
                promises.push(getAPICall(`${cityioURL}${module}/`));
                loadingModules.push(module);
                // if(newHashes[module]){
                // }
            } else {
                promises.push(null);
            }
        });
        dispatch(addLoadingModules(loadingModules));
        const modules = await Promise.all(promises);
        setHashes(newHashes);
        // console.log('modules', modules);

        // update cityio object with modules data
        const modulesData = pickedModules.reduce((obj, k, i) => {
            if (modules[i]) {
                console.log(`updating ${k}`);
                return { ...obj, [k]: modules[i] };
            } else {
                return obj;
            }
        }, cityioData);
        modulesData.tableName = tableName;
        // console.log('modulesData', modulesData);

        dispatch(removeLoadingModules(loadingModules));

        // send to cityio
        dispatch(getCityioData(modulesData));
        console.log("done updating from cityIO");

        // initializes rendering of Menu and Map containers
        dispatch(setReadyState(true));
        dispatch(setLoadingState(false));
    }

    const handleStepByGetCityIOData = (step) => async () => {
        setActiveStep(step);
        let tableName = null;
        switch (step) {
            case 0:
                tableName = 'hcm_test_v1';
                break;
            case 1:
                tableName = 'hcm_test_v2';
                break;
        }
        setLoading(true);
        await getModules(tableName);
        setLoading(false);
    }



    return (
        <>
            {/* <FormControl component="fieldset">
                <FormLabel component="legend">Scenarios</FormLabel>
                <RadioGroup aria-label="my-scenario" name="my-scenario" value={radioValue} onChange={handleRadioChange} >
                    <FormControlLabel value="scenario1" control={<Radio />} label="Scenario 1" disabled={loading} />
                    <FormControlLabel value="scenario2" control={<Radio />} label="Scenario 2" disabled={loading} />
                </RadioGroup>
                
            </FormControl> */}
            {displayUI && <Stepper alternativeLabel nonLinear activeStep={activeStep}>
                {steps.map((label, index) => {
                    return (
                        <Step key={label}>
                            <StepButton
                                onClick={handleStepByGetCityIOData(index)}
                                icon={'•'}
                                disabled={loading}
                            >
                                <StepLabel>{label}</StepLabel>
                            </StepButton>
                        </Step>
                    );
                })}
            </Stepper>}
            {loading && <CircularProgress />}
        </>
    )
}

export default ChooseScenario;