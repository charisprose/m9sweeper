import {Component, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {MatSort} from '@angular/material/sort';
import {MatLegacyTableDataSource as MatTableDataSource} from '@angular/material/legacy-table';
import {AlertService} from '@full-fledged/alerts';
import {IServerResponse} from '../../../../../core/entities/IServerResponse';
import {ApiKeyService} from '../../../../../core/services/api-key.service';
import {IApiKey} from '../../../../../core/entities/IApiKey';
import {MatLegacyDialog as MatDialog} from '@angular/material/legacy-dialog';
import {MatLegacyPaginator as MatPaginator} from '@angular/material/legacy-paginator';
import {AlertDialogComponent} from '../../../../shared/alert-dialog/alert-dialog.component';
import {merge} from 'rxjs';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-api-key-list',
  templateUrl: './api-key-list.component.html',
  styleUrls: ['./api-key-list.component.scss']
})

export class ApiKeyListComponent implements OnInit, AfterViewInit {
  subMenuTitle = 'API Key Management';
  displayedColumns: string[] = ['name', 'api', 'username', 'isActive', 'actions'];
  dataSource: MatTableDataSource<IApiKey>;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  subNavigationTitle: string;
  subNavigationButtonTitle: string;
  subNavigationButtonUrl: any;
  limit = this.getLimitFromLocalStorage() ? Number(this.getLimitFromLocalStorage()) : 10;
  page = 0;
  totalCount = 0;
  data: IApiKey[] = [];

  constructor(
    private apiKeyService: ApiKeyService,
    private dialog: MatDialog,
    private alertService: AlertService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.subNavigationTitle = 'API Key Management';
    this.subNavigationButtonTitle = 'Create API Key';
    this.subNavigationButtonUrl = ['/private', 'api-key', 'create'];
  }

  ngAfterViewInit() {
    merge(this.route.queryParams, this.sort.sortChange).subscribe(() => this.loadAllApiKeys());
  }

  loadAllApiKeys() {
    this.apiKeyService.getAll(this.sort, this.page, this.limit)
    .subscribe((response: IServerResponse<{totalCount: number; list: IApiKey[]}>) => {
      if (response.data) {
        this.totalCount = response.data.totalCount;
        this.data = response.data.list;
        this.dataSource = new MatTableDataSource(this.data);
      }
    }, error => {
      this.alertService.danger(error.error.message);
    });
  }

  pageEvent(pageEvent: {pageSize: number; pageIndex: number; }) {
    this.limit = pageEvent.pageSize;
    this.page = pageEvent.pageIndex;
    this.setLimitToLocalStorage(this.limit);
    this.loadAllApiKeys();
  }

  alertDeleteApiKey(id: number) {
    const openDeleteApiKey = this.dialog.open(AlertDialogComponent, {
      width: '400px',
      closeOnNavigation: true,
      disableClose: true,
      data: {
        functionToRun: this.apiKeyService.deleteApiKey(id),
        afterRoute: ['/private/api-key']
      }
    });

    openDeleteApiKey.afterClosed().subscribe(result => {
      if (result) {
        this.pageEvent({pageSize: this.limit, pageIndex: (this.data.length > 1) ? this.page : 0});
      }
    });
  }

  setLimitToLocalStorage(limit: number) {
    localStorage.setItem('api_key_management_table_limit', String(limit));
  }
  getLimitFromLocalStorage(): string | null {
    return localStorage.getItem('api_key_management_table_limit');
  }
}
