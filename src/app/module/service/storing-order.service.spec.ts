import { TestBed, inject } from '@angular/core/testing';

import { StoringOrderService } from './storing-order.service';

describe('StoringOrderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StoringOrderService]
    });
  });

  it('should be created', inject([StoringOrderService], (service: StoringOrderService) => {
    expect(service).toBeTruthy();
  }));
});
