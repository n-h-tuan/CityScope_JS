import React, { useState, useEffect } from "react";
import { rgbToHex } from "../../../../utils/utils";
import { RadialChart, Hint } from "react-vis";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Typography from "@material-ui/core/Typography";
import "../../../../../node_modules/react-vis/dist/style.css";
import scenario from "../../../../settings/LandUse_0.json";

export default function AreaCalc(props) {
    const radialRadius = 250;
    const [hoveredRadial, setHoveredRadial] = useState(false);
    const [areaData, setAreaData] = useState(null);
    const header = props.cityioData.GEOGRID?.properties?.header;
    useEffect(() => {
        const calcArea = () => {
            let gridProps = props.cityioData.GEOGRID.properties;
            let cellSize = gridProps.header.cellSize;
            let geoGridData = props.cityioData.GEOGRIDDATA;

            let calcAreaObj = {};
            geoGridData.forEach((gridCellData) => {
                let typeName = gridCellData.name;
                if (
                    //    if this type is not null
                    gridCellData.name !== "None"
                ) {
                    if (calcAreaObj.hasOwnProperty(typeName)) {
                        calcAreaObj[typeName].count =
                            calcAreaObj[typeName].count + 1;
                        // avoid landuse with no height
                        let height =
                            gridCellData.height < 1 ? 1 : gridCellData.height;
                        calcAreaObj[typeName].area =
                            calcAreaObj[typeName].area + height * cellSize;
                    } else {
                        calcAreaObj[typeName] = {};
                        calcAreaObj[typeName].area = 0;
                        calcAreaObj[typeName].count = 0;
                        calcAreaObj[typeName].name = typeName;
                        calcAreaObj[typeName].color = rgbToHex(
                            gridCellData.color[0],
                            gridCellData.color[1],
                            gridCellData.color[2]
                        );
                    }
                }
            });
            //  convert to react-vis happy data format
            let radialData = [];
            for (const k in calcAreaObj) {
                radialData.push(calcAreaObj[k]);
            }

            let data = {
                children: radialData,
                color: 1,
            };
            console.log('radialData', radialData);

            return data;
        };
        const calcAreaForHCM = () => {
            let gridProps = props.cityioData.GEOGRID.properties;
            let cellSize = gridProps.header.cellSize;
            let geoGridData = props.cityioData.GEOGRIDDATA;
            // console.log('geoGridData',geoGridData);

            let calcAreaObj = {};
            geoGridData.forEach((gridCellData) => {
                let typeName = gridCellData.LandUseTyp;
                let typeCode = gridCellData.TypeCode;
                let color = (gridCellData.RGB).split(',');
                let shapeArea = Math.round(gridCellData.ShapeArea * 100) / 100;
                if (
                    //    if this type is not null
                    gridCellData.TypeCode !== "None"
                ) {
                    if (calcAreaObj.hasOwnProperty(typeCode)) {
                        // calcAreaObj[typeCode].area = calcAreaObj[typeCode].area + gridCellData.Shape_Area;
                        calcAreaObj[typeCode].area = calcAreaObj[typeCode].area + shapeArea;
                    } else {
                        calcAreaObj[typeCode] = {};
                        // calcAreaObj[typeCode].area = gridCellData.Shape_Area;
                        calcAreaObj[typeCode].area = shapeArea;
                        calcAreaObj[typeCode].name = typeName;
                        calcAreaObj[typeCode].color = rgbToHex(
                            parseInt(color[0]),
                            parseInt(color[1]),
                            parseInt(color[2]),
                        );
                    }
                }
            });
            //  convert to react-vis happy data format
            let radialData = [];
            for (const k in calcAreaObj) {
                radialData.push(calcAreaObj[k]);
            }

            let data = {
                children: radialData,
                color: 1,
            };
            // console.log('radialData', radialData);

            return data;
        };
        let d;
        if (header.tableName && header.tableName.includes('hcm_')) {
            d = calcAreaForHCM();
        }
        else {
            d = calcArea();
        }
        setAreaData(d);
    }, [props]);

    return (
        <List>
            {areaData && areaData.children && (
                <ListItem alignItems="center">
                    <RadialChart
                        colorType="literal"
                        animation={true}
                        className={"donut-chart-example"}
                        innerRadius={radialRadius / 2 - radialRadius / 5}
                        radius={radialRadius / 2}
                        getLabel={(d) => d.name}
                        labelsRadiusMultiplier={0.95}
                        labelsStyle={{
                            textAnchor: "middle",
                            font: "sans-serif",
                            fontSize: 11,
                            fill: "#FFF",
                            textShadow: "2px 2px 2px #000",
                            fontFamily: "Roboto Mono",
                        }}
                        showLabels
                        getAngle={(d) => d.area}
                        data={areaData.children}
                        onValueMouseOver={(evt) => setHoveredRadial(evt)}
                        onSeriesMouseOut={() => setHoveredRadial(false)}
                        width={radialRadius}
                        height={radialRadius}
                        padAngle={0.01}
                    >
                        {hoveredRadial !== false && (
                            <Hint value={hoveredRadial}>
                                <div
                                    style={{
                                        background: "rgba(0,0,0,0.8)",
                                        fontSize: 14,
                                    }}
                                >
                                    <Typography
                                        variant={"caption"}
                                        gutterBottom
                                    >
                                        Area: {hoveredRadial.area} sqm
                                    </Typography>
                                </div>
                            </Hint>
                        )}
                    </RadialChart>
                </ListItem>
            )}

            {hoveredRadial.name && (
                <List>
                    <ListItem>
                        <Typography variant="caption">
                            {hoveredRadial.name}
                        </Typography>
                    </ListItem>
                    <ListItem>
                        <Typography>{hoveredRadial.area} sqm</Typography>
                    </ListItem>
                </List>
            )}
        </List>
    );
}
