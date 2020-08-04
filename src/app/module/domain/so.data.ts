import { MtContainerData } from "./mtc.data";
import { VesselInfoData } from "./vessel.data";

export class StoringOrderData {
    public cntrN: string;
    public lengthQ: string;
    public typeC: string;
    public heightQ: string;
    public consigneeM: string;
    public haulierOrgC: string;
    public instructionToHaulierX: string;
    public depotC: string;
    public freePeriodN: number;
    public expiryDt: string;
    public remarkX: string;
    public depotRemarkX: string;

    public discBaId: string;
    public authN: string;
    public berthTime: string;
    public cmplOfDisChrg: string;
    public portC: string;
    public terminal: string;
    public cntrOprC: string;
    public statusC: string;

    public exitDt: string;
    public storedDt: string;


    public soId: string;

    public mtContainer: MtContainerData;

    public vesselInfo: VesselInfoData;

    public vsIM: string;
    
}
