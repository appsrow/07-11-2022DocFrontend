import { Component, OnInit } from '@angular/core';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { AdminService } from '../../services/admin.service';
import * as moment from 'moment';
import { InvoiceList, InvoiceListDetails, DownloadInvoice } from '../../models/admin.model';
import { HeaderService } from 'src/app/shared/services/header.service';
@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent implements OnInit {
  error: string = '';
  invoiceData: InvoiceListDetails[] = [];
  pdfName:any;
  constructor(
    private adminService: AdminService,
    public utilityService: UtilityService,
    private headerService: HeaderService
  ) { }

  ngOnInit(): void {
    this.getAllInvoices();
  }
  async getAllInvoices() {
    this.utilityService.showLoading();
    try {
      const res: InvoiceList =  await this.adminService.getAllInvoices();
      if (res.success = true) {
        this.utilityService.hideLoading();
        this.invoiceData = res.data;
        for (var i = 0; i < this.invoiceData.length; i++) {
          this.invoiceData[i].converted_InvoiceDate = moment(this.invoiceData[i].invoice_date).format('DD/MM/YYYY')
        }
        setTimeout(() => {
          $('#invoiceTable').DataTable({
            pagingType: 'full_numbers',
            pageLength: 10,
            processing: true,
            lengthMenu: [5, 10, 15],
            destroy: true,
            order: []
          });
        }, 1);
      }
      else {
        this.utilityService.hideLoading();
        this.error = res.message;
      }
    }
    catch (error) {
      this.utilityService.hideLoading();
    }
  }

  async downloadInvoice(id: number, invoice_id: string) {
      this.utilityService.showLoading();
      const response: DownloadInvoice = await this.adminService.downloadInvoice(id);
      const byteArray = new Uint8Array(atob(response.data).split('').map(char => char.charCodeAt(0)));
      const file = new Blob([byteArray], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      this.headerService.switchLanguage.subscribe(res => {
        if (res == 'es') {
          this.pdfName = "Factura_" + invoice_id + ".pdf";
        } 
        else {
          this.pdfName = "Invoice_" + invoice_id + ".pdf";
        }
      });
      this.utilityService.hideLoading();
      let link = document.createElement("a");
      link.download = this.pdfName;
      link.target = "_blank";
      link.href = fileURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }
}
