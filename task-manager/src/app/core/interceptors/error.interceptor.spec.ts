import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { errorInterceptor } from './error.interceptor';
import { vi } from 'vitest';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let mockSnackBar: any;

  beforeEach(() => {
    mockSnackBar = {
      open: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should catch client-side error and open snackbar', () => {
    http.get('/test').subscribe({
      error: (err) => {
        expect(err).toBeTruthy();
      }
    });

    const req = httpMock.expectOne('/test');
    const errorEvent = new ErrorEvent('Network error', { message: 'Client network error' });
    req.error(errorEvent);

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Error: Client network error',
      'Close',
      { duration: 5000, panelClass: ['error-snackbar'] }
    );
  });

  it('should catch server-side error with message and open snackbar', () => {
    http.get('/test').subscribe({
      error: (err) => {
        expect(err).toBeTruthy();
      }
    });

    const req = httpMock.expectOne('/test');
    req.flush({ message: 'Server specific error' }, { status: 500, statusText: 'Server Error' });

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Server specific error',
      'Close',
      { duration: 5000, panelClass: ['error-snackbar'] }
    );
  });

  it('should catch server-side error without message and open snackbar with generic text', () => {
    http.get('/test').subscribe({
      error: (err) => {
        expect(err).toBeTruthy();
      }
    });

    const req = httpMock.expectOne('/test');
    req.flush(null, { status: 404, statusText: 'Not Found' });

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      expect.stringContaining('Error Code: 404'),
      'Close',
      { duration: 5000, panelClass: ['error-snackbar'] }
    );
  });
});
