import { Component, Inject, OnInit } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { IGatekeeperConstraintViolation } from '../../../../../core/entities/IGateKeeperConstraint';

@Component({
  selector: 'app-gatekeeper-violation-dialog',
  templateUrl: './gatekeeper-violation-dialog.component.html',
  styleUrls: ['./gatekeeper-violation-dialog.component.scss']
})
export class GatekeeperViolationDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<GatekeeperViolationDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {violations: IGatekeeperConstraintViolation}) { }

  ngOnInit(): void {
  }

  onClose() {
    this.dialogRef.close();
  }

}
