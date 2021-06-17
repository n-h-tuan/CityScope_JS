import React from "react";
import { List, ListItem, Divider, Container, Box } from "@material-ui/core";
import Radar from "./Radar";
import BarChart from "./BarChart";
import AreaCalc from "./AreaCalc";

function VisContainer(props) {
    console.log('vào viscontainer');
    return (
        <>
            {props.cityIOdata && (
                <Container>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <AreaCalc cityioData={props.cityIOdata} />
                        <Radar cityioData={props.cityIOdata} />
                    </Box>
                    <Divider />
                    <Box display="flex" alignItems="center" justifyContent="center">
                        <BarChart cityioData={props.cityIOdata} />
                    </Box>
                </Container>
                // <List>
                //     <ListItem style={{justifyContent: "center"}}>
                //         <AreaCalc cityioData={props.cityIOdata} />
                //     </ListItem>

                //     <Divider />

                //     <ListItem style={{justifyContent: "center"}}>
                //         <Radar cityioData={props.cityIOdata} />
                //     </ListItem>

                //     <Divider />

                //     <ListItem style={{justifyContent: "center"}}>
                //         <BarChart cityioData={props.cityIOdata} />
                //     </ListItem>
                // </List>
            )}
        </>
    );
}

export default VisContainer;
