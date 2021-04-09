/* Code generated by cmd/cgo; DO NOT EDIT. */

/* package command-line-arguments */


#line 1 "cgo-builtin-prolog"

#include <stddef.h> /* for ptrdiff_t below */

#ifndef GO_CGO_EXPORT_PROLOGUE_H
#define GO_CGO_EXPORT_PROLOGUE_H

typedef struct { const char *p; ptrdiff_t n; } _GoString_;

#endif

/* Start of preamble from import "C" comments.  */


#line 3 "main.go"
 #include <stdio.h>
 #include <stdlib.h>

#line 1 "cgo-generated-wrapper"


/* End of preamble from import "C" comments.  */


/* Start of boilerplate cgo prologue.  */
#line 1 "cgo-gcc-export-header-prolog"

#ifndef GO_CGO_PROLOGUE_H
#define GO_CGO_PROLOGUE_H

typedef signed char GoInt8;
typedef unsigned char GoUint8;
typedef short GoInt16;
typedef unsigned short GoUint16;
typedef int GoInt32;
typedef unsigned int GoUint32;
typedef long long GoInt64;
typedef unsigned long long GoUint64;
typedef GoInt32 GoInt;
typedef GoUint32 GoUint;
// typedef __SIZE_TYPE__ GoUintptr;
// typedef float GoFloat32;
// typedef double GoFloat64;
// typedef float _Complex GoComplex64;
// typedef double _Complex GoComplex128;

/*
  static assertion to make sure the file is being used on architecture
  at least with matching size of GoInt.
*/
typedef char _check_for_32_bit_pointer_matching_GoInt[sizeof(void*)==32/8 ? 1:-1];

typedef _GoString_ GoString;
typedef void *GoMap;
typedef void *GoChan;
typedef struct { void *t; void *v; } GoInterface;
typedef struct { void *data; GoInt len; GoInt cap; } GoSlice;

#endif

/* End of boilerplate cgo prologue.  */

#ifdef __cplusplus
extern "C" {
#endif


extern void SetDataDirectory(GoString p0);

extern void SetVModule(GoString p0);

extern GoUint8 StartNode(GoString p0, GoString p1);

extern GoUint8 StopNode();

extern char* GameCall(GoString p0);

extern char* GameSubscribe(GoString p0, GoInt64 p1);

extern char* CreateAccount(GoString p0);

extern GoUint8 UnlockAccountWithPassword(GoString p0, GoString p1);

extern char* ImportAccountWithPasswordAndLanguage(GoString p0, GoString p1, GoString p2);

extern char* GetAccounts();

extern void LogTrace(GoString p0);

extern void LogDebug(GoString p0);

extern void LogInfo(GoString p0);

extern void LogWarn(GoString p0);

extern void LogError(GoString p0);

extern void Init(GoString p0, GoString p1);

extern void UnInit();

extern void FreeString(char* p0);

#ifdef __cplusplus
}
#endif
