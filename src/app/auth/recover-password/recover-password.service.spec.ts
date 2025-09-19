import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import {
  RecoverPasswordService,
  UpdatePasswordDto,
} from './recover-password.service';
import { environment } from '../../../environments/environment';

describe('RecoverPasswordService', () => {
  let service: RecoverPasswordService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RecoverPasswordService],
    });
    service = TestBed.inject(RecoverPasswordService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('updatePasswordByEmail hits public endpoint', () => {
    const dto: UpdatePasswordDto = {
      currentPassword: 'old',
      newPassword: 'newpass1',
    };
    service.updatePasswordByEmail('a@a.com', dto).subscribe();
    const req = httpMock.expectOne(
      `${environment.apiUrl}/users/by-email/a%40a.com/password`
    );
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(dto);
    req.flush({ ok: true });
  });
});
