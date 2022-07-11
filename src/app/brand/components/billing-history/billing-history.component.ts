import { Component, OnInit } from '@angular/core';
import { BrandService } from '../../services/brand.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { InvoiceData, InvoiceDetailData } from '../../models/invoice.model';
import * as moment from 'moment';
import { HeaderService } from 'src/app/shared/services/header.service';
@Component({
  selector: 'app-billing-history',
  templateUrl: './billing-history.component.html',
  styleUrls: ['./billing-history.component.scss']
})
export class BillingHistoryComponent implements OnInit {
  error: string = '';
  invoiceData:InvoiceDetailData = {data: [], success: false, message: '' };
  invoiceId:number = 0;
  pdfName:any;
  constructor(private brandService: BrandService,
    public utilityService: UtilityService,
    private headerService: HeaderService)
    { }
  ngOnInit(): void {
    this.getInvoice();
  }
 async getInvoice() {
    this.utilityService.showLoading();
      try {
        const response: InvoiceDetailData = await this.brandService.getInvoice();
        if (response.success) {
          this.utilityService.hideLoading();
          this.invoiceData = response;
          
          for (var i = 0; i < this.invoiceData.data.length; i++) {
            this.invoiceData.data[i].converted_InvoiceDate = moment(this.invoiceData.data[i].invoice_date).format('DD/MM/YYYY');
          }
          setTimeout(()=>{                          
            $('#datatableexample2').DataTable( {
              pagingType: 'full_numbers',
              pageLength: 10,
              processing: true,
              lengthMenu : [5, 10, 15],
              destroy: true,
              order: []
          } );
          }, 1);
        } else {
          this.error = response.message;
          throw new Error(response.message);
        }
      } catch (error) {
        this.utilityService.hideLoading();
      }
   
  }
  async downloadInvoice(id: number, invoice_id:number){
    this.utilityService.showLoading();
    this.invoiceId = invoice_id;
    await this.brandService.downloadInvoice(id).then((response: any) => {
    const byteArray = new Uint8Array(atob(response.data).split('').map(char => char.charCodeAt(0)));
    const file =  new Blob([byteArray], {type: 'application/pdf'});
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
    })
  }

}
