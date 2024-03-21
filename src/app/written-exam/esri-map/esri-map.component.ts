import { Component, Input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { loadModules } from 'esri-loader';
import { IAnswer, MapPoints } from '../../core/interfaces/exam-interface';
import { SignalService } from '../../core/services/signal/signal.service';
const options = { version: '4.15', css: true };

@Component({
    selector: 'app-esri-map',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './esri-map.component.html',
    styleUrl: './esri-map.component.scss'
})
export class EsriMapComponent {
    @Input() set answers(value: IAnswer[]) {
        if (value && value.length) {
            this.points = value.filter((ans: IAnswer) => !!ans.points).map((ans: IAnswer) => ans.points) as MapPoints[];
            this.questionID = value[0].QUESTION_ID;
        }
    }
    questionID!: number;
    selectedPoint: any;
    esriPointSelectForm!: FormGroup;
    defaultCenterLat = 24.4539;
    defaultCenterLon = 54.3773;
    defaultZoom: any;
    showDetailsDiv = false;
    clickedLocationName = 'No Points Selected';
    esriSelectedPoints: any = [];
    clickedPoint: any;
    data: any;
    view: any;
    graphicsLayer: any;
    defaultPin = {
        type: "picture-marker",  // autocasts as new PictureMarkerSymbol()
        url: "assets/images/marker-default.png",
        width: "39px",
        height: "52px"
    }
    selectedPin = {
        type: "picture-marker",  // autocasts as new PictureMarkerSymbol()
        url: "assets/images/marker-selected.png",
        width: "39px",
        height: "52px"
    };
    points: MapPoints[] = []
    pointButtons = this.points.map((elem: any) => {
        return { item: elem, selected: false }
    });
    constructor(private signal: SignalService) {
        this.loadEsri();
        effect(() => {
            this.updatePointsFromSignal = this.signal.selectedMapPoint;
        })
    }
    set updatePointsFromSignal(value: any) {
        if (value && value[this.questionID]) {
            const { item, isFromMap } = value[this.questionID];
            this.updatePoints(item, isFromMap);
        }
    }
    updatePoints(row: any, goTo = true) {
        const old = this.graphicsLayer.graphics;
        old.forEach((element: any) => {
            const pin = element.attributes.mark;
            const found = JSON.stringify(pin) === JSON.stringify(row);
            element.symbol = found ? this.selectedPin : this.defaultPin;
            if (found && goTo) {
                this.view.goTo({
                    center: [element.geometry.longitude, element.geometry.latitude],
                    zoom: 12
                });
            }
        });
    }
    loadEsri() {
        loadModules([
            "esri/tasks/Locator",
            "esri/Map",
            "esri/views/MapView",
            "esri/Graphic",
            "esri/layers/GraphicsLayer"], options).then(([Locator, Map, MapView, Graphic, GraphicsLayer]) => {
                const locatorTask = new Locator({
                    url:
                        "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
                });
                const map = new Map({
                    basemap: "streets-vector",
                });
                this.view = new MapView({
                    container: "viewDiv",
                    map: map,
                    center: [this.defaultCenterLon, this.defaultCenterLat],
                    zoom: 12,
                });
                /* Click On Map */
                this.view.on("click", (event: any) => {

                    const screenPoint = {
                        x: event.x,
                        y: event.y
                    };
                    this.view.hitTest(screenPoint).then(({ results }: any) => {
                        if (results.length) {
                            const found = this.points.find((item: any) => {
                                return results.some(({ graphic: { attributes: { mark } } }: any) => JSON.stringify(item) === JSON.stringify(mark))
                            });
                            if (found) {
                                this.signal.selectedMapPoint = {
                                    ...this.signal.selectedMapPoint ?? {},
                                    [this.questionID]: {
                                        item: found, isFromMap: false
                                    }
                                };
                            }
                        }
                    })
                });

                this.graphicsLayer = new GraphicsLayer();
                map.add(this.graphicsLayer);
                this.points.forEach(mark => {
                    const pointGraphic = new Graphic({
                        geometry: mark,
                        symbol: this.defaultPin,
                        attributes: { mark }
                    });
                    this.graphicsLayer.add(pointGraphic);
                })

            });
    }

}
