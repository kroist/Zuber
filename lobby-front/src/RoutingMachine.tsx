import L, {ControlOptions} from "leaflet";
import { createControlComponent } from "@react-leaflet/core";
// @ts-ignore
import "leaflet-routing-machine";

export interface RoutingMachineOptions extends ControlOptions {
  points: [number, number][];
  id: number;
  lengths: number[];
};

const colors = [
  "#6FA1EC",
  "#FF8552",
  "#01BAEF",
  "#A5CC6B",
  "#F06C9B"
];

const createRoutineMachineLayer = (props: RoutingMachineOptions) => {
  console.log(props.id);
  console.log(colors.length);
  console.log(colors[
    props.id % colors.length
  ]);
  const instance = L.Routing.control({
    lineOptions: {
      styles: [{ color: colors[
        props.id % colors.length
      ], weight: 4 }],
      extendToWaypoints: false,
      addWaypoints: false,
      missingRouteTolerance: 0
    },
    plan: L.Routing.plan(
      [
        L.latLng(props.points[0][0], props.points[0][1]),
        L.latLng(props.points[1][0], props.points[1][1])
      ], {
      createMarker: function(w1, w2, w3) {return false;},
    }),
    show: false,
    routeWhileDragging: true,
    fitSelectedRoutes: false,
    showAlternatives: false,
    useZoomParameter: false,
  });

  instance.on('routesfound', function(e) {
    console.log(e);
    let newDist = Math.floor(e.routes[0].summary.totalDistance);
  });

  return instance;
};

const RoutingMachine = createControlComponent(createRoutineMachineLayer);

export default RoutingMachine;
