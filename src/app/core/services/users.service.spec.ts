import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { UsersService, CreateUserDto } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UsersService],
    });
    service = TestBed.inject(UsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('create should POST to /users with payload', () => {
    const dto: CreateUserDto = {
      nombreUsuario: 'jdoe',
      correoElectronico: 'jdoe@example.com',
      contrasena: 'Secret123',
      rol: 'Empleado',
      primerNombre: 'John',
      primerApellido: 'Doe',
      segundoNombre: '',
      segundoApellido: 'Smith',
      posicion: 'Dev',
    };
    service.create(dto).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/users`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush({ id: 1, ...dto });
  });
});
