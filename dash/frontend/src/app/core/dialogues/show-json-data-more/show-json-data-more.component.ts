import {Component, Inject, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FalcoService} from '../../services/falco.service';
import { MatTableDataSource } from '@angular/material/table';
import {IFalcoLog} from '../../entities/IFalcoLog';
import {take} from 'rxjs/operators';
import {AlertService} from '@full-fledged/alerts';
import { jsonToTableHtmlString } from 'json-table-converter';
import {IFalcoCount} from '../../entities/IFalcoCount';

@Component({
  selector: 'app-show-json-data-more',
  templateUrl: './show-json-data-more.component.html',
  styleUrls: ['./show-json-data-more.component.scss']
})
export class ShowJsonDataMoreComponent implements OnInit {
  header: string;

  constructor(
              private route: ActivatedRoute,
              private falcoService: FalcoService,
              private alertService: AlertService,
  ) { }

  dataSource: MatTableDataSource<IFalcoLog>;
  displayedColumns = ['calendarDate', 'namespace', 'pod', 'image', 'message'];

  signature: string;
  clusterId: number;
  eventId: number;

  namespace: string;
  date: string;
  pod: string;
  image: string;
  message: string;
  raw: object;
  format: string;
  rawInFormat: string;

  limit = this.getLimitFromLocalStorage() ? Number(this.getLimitFromLocalStorage()) : 20;
  logCount: number;
  page: number;

  falcoCountData: IFalcoCount[];

  barChartAttributes = {
    view: [] = [500, 400],
    colorScheme: {
      domain: ['#f3865f']
    },
    results: [],
    gradient: false,
    showXAxis: true,
    showYAxis: true,
    barPadding: 10,
    showLegend: false,
    legendPosition: 'below',
    showXAxisLabel: true,
    showYAxisLabel: true,
    yAxisLabel: 'Number of Occurrence',
    xAxisLabel: 'Day of Month',
  };

  ngOnInit(): void {

    this.clusterId = this.route.parent.parent.snapshot.params.id;
    this.eventId = this.route.snapshot.params.eventId;
    this.signature = this.route.snapshot.params.signature;

    this.getEventById();
    this.getRelatedEvents();

    this.buildBarChartData();
  }

  pageEvent(pageEvent: any) {
    this.limit = pageEvent.pageSize;
    this.page = pageEvent.pageIndex;
    this.setLimitToLocalStorage(this.limit);
    this.getEventById();
    this.getRelatedEvents();
    this.buildBarChartData();

  }

  getEventById(){
      this.falcoService.getFalcoLogByEventId( this.eventId )
      .pipe(take(1))
      .subscribe(response => {
        this.namespace = response.data.namespace;
        this.date = response.data.calendarDate;
        this.pod = response.data.container;
        this.image = response.data.image;
        this.message = response.data.message;
        this.raw = response.data.raw;

      }, (err) => {
        alert(err);
      });
  }

  getRelatedEvents(){
    this.falcoService.getFalcoLogs(this.clusterId,  { limit: this.limit, page: this.page, signature: this.signature})
      .pipe(take(1))
      .subscribe(response => {
        this.dataSource = new MatTableDataSource(response.data.list);
        this.logCount = response.data.logCount;
      }, (err) => {
        alert(err);
      });
  }

  stripDomainName(image: string): string {
    const regex = /^([a-zA-Z0-9]+\.[a-zA-Z0-9\.]+)?\/?([a-zA-Z0-9\/]+)?\:?([a-zA-Z0-9\.]+)?$/g;
    const group = image.split(regex);
    // strip domain, only image
    if (group[2] !== undefined && group[3] === undefined){
      return (group[2]);
    } else if (group[3] !== undefined){
      return (group[2] + group [3]);
    } else if (group[2] === undefined){
      return '';
    }
  }

  getLimitFromLocalStorage(): string | null {
    return localStorage.getItem('falco_table_limit');
  }

  setLimitToLocalStorage(limit: number) {
    localStorage.setItem('falco_table_limit', String(limit));
  }

  buildBarChartData() {
      this.falcoService.getCountOfFalcoLogsBySignature(this.clusterId, this.signature)
      .pipe(take(1))
      .subscribe(response => {

          this.falcoCountData = response.data;
          if (this.falcoCountData && this.falcoCountData.length > 0) {
            this.barChartAttributes.results = [
              {
                name: '',
                series: this.falcoCountData.map(elem =>
                {
                  return {
                    name: elem.date.toString().split('T')[0],
                    value: Number(elem.count)
                  };
                })
              }
            ];
            console.log('result: ', this.barChartAttributes.results);
            console.log('result type: ', typeof(this.barChartAttributes.results));
          } else{
            return false;
          }
/*
          this.barChartAttributes.results = [
            {
              name: 'Germany',
              value: 89
            },
            {
              name: 'USA',
              value: 50
            },
            {
              name: 'France',
              value: 1000
            }
          ];
*/

          /*
          this.falcoCountData.map(elem =>
            this.barChartAttributes.results.push(
              {
                name: elem.date.toString().split('T')[0],
                value: Number(elem.count)
              }));
           */

          // console.log('result first ele: ', this.barChartAttributes.results[0].name);
          // console.log('result first ele: ', this.barChartAttributes.results[0].value);

        },
        error => {
          this.alertService.danger(error.error.message);
        });
  }

  onClickShare(){

  }

  onClickYaml(){

  }
  onClickJson(){
    this.format = 'json';
    this.rawInFormat = JSON.stringify(this.raw, null, '\t');
  }

  onClickTable(){
    this.format = 'table';
    this.rawInFormat = jsonToTableHtmlString(this.raw);
  }
}
