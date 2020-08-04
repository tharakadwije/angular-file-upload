import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextareaModule, ButtonModule, AccordionModule, GalleriaModule, ChartModule, DataTableModule, MultiSelectModule, MenuModule, ContextMenuModule, SplitButtonModule, SelectButtonModule, CalendarModule, SlideMenuModule, AutoCompleteModule, BlockUIModule, CheckboxModule, ConfirmDialogModule, DataListModule, DialogModule, DragDropModule, DropdownModule, GrowlModule, InputTextModule, MessagesModule,PaginatorModule, PanelModule, ProgressSpinnerModule, RadioButtonModule, TooltipModule, TabViewModule, ListboxModule } from 'primeng/primeng';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LocaleService, PCSUIModule, DateUtilService } from '@pc/pc-sui';
import { SORoutingModule } from './so-routing.module';
import { SOSearchComponent } from './so-search/so-search.component';
import { SOComponent } from './so.components';
import { SOCreateUpdateComponent } from './so-create-update/so-create-update.component';
import { SearchViewComponent } from './so-search/search-view/search-view.component';
import { StoringOrderService } from './service/storing-order.service';
import { DateConverterPipe } from './util/date-converter.pipe';
import { StringConverterPipe } from './util/string-converter.pipe';
import { SOResolve } from './resolve/so.resolve';
import { SOAuthorizationGuard } from './guard/so.authorization.guard';
import { StringValidateRevealed } from './util/string-validate-revealed';
import { NumberConverterPipe } from './util/number-converter.pipe';


@NgModule({
  imports: [
    CommonModule,
    ButtonModule,
    AccordionModule,
    GalleriaModule,

    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    DataTableModule,
    MultiSelectModule,
    MenuModule,
    CalendarModule,
    DialogModule,
    ContextMenuModule,
    SplitButtonModule,
    SelectButtonModule,
    CalendarModule,
    SlideMenuModule,
    AutoCompleteModule,
    SORoutingModule,
    TabViewModule,
    PCSUIModule,
    PanelModule,
    MessagesModule,
    DropdownModule,
    RadioButtonModule,
    CheckboxModule,
    InputTextareaModule,
    BlockUIModule,
    GrowlModule,
    ProgressSpinnerModule,

  ],
  declarations: [
    SOCreateUpdateComponent,
    SOComponent,
    SOSearchComponent,
    SearchViewComponent,
    DateConverterPipe,
    StringConverterPipe,
    NumberConverterPipe,

  ], 
  providers: [
    LocaleService,
    StoringOrderService,
    DateUtilService,
    StringValidateRevealed,
    SOResolve,
    SOAuthorizationGuard,
  
  ]
})
export class SOModule { }
