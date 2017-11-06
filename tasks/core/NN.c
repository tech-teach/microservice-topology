#include <unistd.h>
#include <errno.h>
#include <math.h>
#include <stdio.h>
#include <pthread.h>
#include <stdlib.h>
#include <string.h>
#include <sys/sysinfo.h>
#include <stdint.h>
struct sysinfo si;
#ifdef INFINITY
#endif
extern int errno;
int numfil=0;
int numcol=0;
int indice=0;
float *vectorData;
float *lineslabels;
float *allLabels;

float (* fptr)(float*,float*);
float max(float a, float b);
float min(float a, float b);


typedef struct thread_data{
  int thread_id;
  float *labelsTrainingVector;
  float *distances;
  float *labelSort;
  float labelTest;
  float *trainingMatriz;
  float *testVector;
  float *stdVector;
  float *meanVector;
} datastruct;
datastruct *thread_data_array=NULL;



/****************************************************************
 *                      Distances / Dissimilarity               *
 ****************************************************************/
float  euclideanDist(float *vectorx,float *vectory)
{
  int i=0;
  float d=0;
  for(i=0;i<numcol-1;i++)
  {
    d+=pow((vectorx[i]-vectory[i]),2);
  }
  return d=sqrt(d);
}
/****************************************************************/
float  chessBoardDist(float *vectorx,float *vectory)
{
  int i=0;
  float d=0;
  float maxi=abs(vectorx[i]-vectory[i]);
  for(i=1;i<numcol-1;i++)
  {
    if(abs(vectorx[i]-vectory[i])>=maxi)   
    maxi=abs(vectorx[i]-vectory[i]);
  }
  return d=maxi;
}
/****************************************************************/
float  waveEdgesDist(float *vectorx,float *vectory)
{
  int i=0;
  float d=0;
  for(i=1;i<numcol-1;i++)
  {
    d+=1-(min(vectorx[i],vectory[i])/max(vectorx[i],vectory[i]));
  }
  return d=d/(numcol-1);
}
/****************************************************************/
float  soergelDist(float *vectorx,float *vectory)
{
 int i=0;
 float d=0;
 float den=0;
 for(i=0;i<numcol-1;i++)
 {
   d+=abs(vectorx[i]-vectory[i]);
   den=max(vectorx[i],vectory[i]);
 }
 return d=d/den;
}
/****************************************************************/
float  lagrangeDist(float *vectorx,float *vectory)
{
  int i=0;
  float d=abs(vectorx[0]-vectory[0]);
  for(i=1;i<numcol-1;i++)
  {
    d=max(d,abs(vectorx[i]-vectory[i]));
  }
  return d;
}
/****************************************************************/
float  cuadraticDist(float *vectorx,float *vectory)
{
  int i,j=0;
  float d=abs(vectorx[0]-vectory[0]);
  for(i=1;i<numcol-1;i++)
  for(j=1;j<numcol-1;j++)
  {
    d+=pow(vectorx[i]-vectory[i],2)*pow(vectorx[j]-vectory[j],2);
  }
  return d;
}
/****************************************************************/
float  manhattanDist(float *vectorx,float *vectory)
{
  int i=0;
  float d=0;
  for(i=0;i<numcol-1;i++)
  {
    d+=abs(vectorx[i]-vectory[i]);
  }
  return d;
}
/****************************************************************/
float  minkowskiDist (float *vectorx,float *vectory)
{
  int i=0;
  float d=0;
  int charact=numcol-1;
  for(i=0;i<numcol-1;i++)
  {
    d+=pow(abs(vectorx[i]-vectory[i]),charact);
  }
  return d=pow(d,(double)1/charact);
}
/****************************************************************/
float canberraDist(float *vectorx,float *vectory)
{
  int i=0;
  float d=0;
  int charact=numcol-1;
  float num;
  float den;
  for(i=0;i<numcol-1;i++)
  {
    num=abs(vectorx[i]-vectory[i]);
    den=abs(vectorx[i])+abs(vectory[i]);
    if(den==0)
    {
     d+=1 ;
    }
    else
    {
     d+= num/den; 
    }
  }
  return d=(d/charact);
}
/****************************************************************/
float lanceWilliamDist(float *vectorx,float *vectory)
{
  int i=0;
  float d=0;
  float num;
  float den1;
  float den;
  for(i=0;i<numcol-1;i++)
  {
    num+=abs(vectorx[i]-vectory[i]);
    den+=(vectorx[i]);
    den1+=(vectory[i]);
  }
  return d= num/(den+den1);
}
/****************************************************************/
float clarkDist(float *vectorx,float *vectory)
{
  int i=0;
  float d=0;
  float num;
  float sum;
  float den;
  for(i=0;i<numcol-1;i++)
  {
    num=pow(abs(vectorx[i]-vectory[i]),2);
    den=vectorx[i]+vectory[i];
    sum+=num/den;
  }
  return d= sqrt(sum)/(numcol-1);
}
/****************************************************************/
float MatusitaDist(float *vectorx,float *vectory)
{
  int i=0;
  float d=0;
  float num;
  for(i=0;i<numcol-1;i++)
  {
    num=pow(sqrt(vectorx[i])-sqrt(vectory[i]),2)/(numcol-1);
  }
  return d=sqrt(num);
}
/****************************************************************/
float  cosineDist(float *vectorx,float *vectory)
{
  int i=0;
  float d=0;
  float den1=0;
  float den2=0;
  for(i=0;i<numcol-1;i++)
  {
    d+=vectorx[i]*vectory[i];
  }
  for(i=0;i<numcol-1;i++)
  {
    den1+=pow(vectorx[i],2);
    den2+=pow(vectory[i],2);
  }
 return d=1-(d/(sqrt(den1)*sqrt(den2)));
}
/****************************************************************/
float  JaccardTanimotoDist(float *vectorx,float *vectory)
{
 int i=0;
 float d=0;
 float den1=0;
 float den2=0;
 for(i=0;i<numcol-1;i++)
 {
   d+=vectorx[i]*vectory[i];
 }
 for(i=0;i<numcol-1;i++)
 {
   den1+=pow(vectorx[i],2);
   den2+=pow(vectory[i],2);
 }
 return d=1-d/((den1)+(den2)-d);
}
/******************************************************************************************************
***********         Funciones       *******************************************************************
******************************************************************************************************/

struct sysinfo si;

float min(float a, float b)
{
  if (a < b)
    return a;
  else
    return b;
}

float max(float a, float b)
{
  if (a > b)
    return a;
  else
    return b;
}

int sign(float valor)
{
  if (valor>=0)
    return 1;
  else
    return 0;
}

float positiveWeight(float h1, float h2)
{
   return min(h1, h2)/max(h1,h2);
}

float negativeWeight(float h1, float h2)
{
   return 1- min(h1,h2)/max(h1,h2);
}

float sum(float array[], int n)
{
   int i;
   float total;
   total=0;
   for (i=0;i<n;i++)
     total+=array[i];
   return total;
}

float wdmSimilarity1(float H1[], float H2[])
{
  float wdm=0,w,v,peakH1,peakH2;
  int i;
  int n=numcol-1;

  for (i=0;i<n-1;i++)
  {
    peakH1=H1[i]-H1[i+1];
    peakH2=H2[i]-H2[i+1];
    if (sign(peakH1)==sign(peakH2))
    {
      w = positiveWeight(H1[i],H2[i]);
      wdm=wdm+w;
    }
    else
    {
      v = negativeWeight(H1[i],H2[i]);
      wdm=wdm-v;
    }
  }
  return wdm;
}

/****************************************************************/
void *promedio(void *threadid)
{
  float dato1=0;
  long tid;
  tid = (long)threadid;
  int j=0;
  for(j=0; j<numfil-1; j++)
  {
    dato1+=thread_data_array[indice].trainingMatriz[j*numcol+tid];
  }
  dato1=dato1/(numfil-1);
  thread_data_array[indice].meanVector[tid]=dato1;
  pthread_exit(NULL);
}
/****************************************************************/
void findstdVectorCeros()
{
  int i=0;
  for(i=0;i<numcol-1;i++)
  {
    if( thread_data_array[indice].stdVector[i]==0)
    {
       thread_data_array[indice].stdVector[i]=1;
    }
  }
}
/****************************************************************/
void  obtainlabelsVector()
{
  
  thread_data_array[indice].labelsTrainingVector=(float*)malloc(sizeof(float)*numfil);
  if(thread_data_array[indice].labelsTrainingVector==NULL)
  {
     exit(EXIT_FAILURE);
  }
  int i=0,j=0,k=0;
  int cont=numcol-1;
  for(i=cont;i<(numfil)*(numcol);i+=numcol)
  {
    if(j==indice)
    {
      thread_data_array[indice].labelTest=vectorData[i] ;
      j++;
    }
    else
    {
      thread_data_array[indice].labelsTrainingVector[k]=vectorData[i];
      k++;
      j++;
    }
  }
}
/****************************************************************/
void obtainAllLabels()
{
  allLabels=(float*)malloc(sizeof(float)*numfil);
  if(allLabels==NULL)
  {
    exit(EXIT_FAILURE);
  }
  int j=0,i=0;
  for(i=(numcol-1);i<(numfil)*(numcol);i+=numcol)
  {
    allLabels[j]=vectorData[i];
    j++;
  } 
}
/****************************************************************/

void obtainTrainingTestVector()
{
  thread_data_array[indice].trainingMatriz=(float*)malloc(sizeof(float)*(numfil-1)*numcol);
  if(thread_data_array[indice].trainingMatriz == NULL )
  {
      exit(EXIT_FAILURE);
  }

  thread_data_array[indice].testVector=(float*)malloc(sizeof(float)*numcol);
  if(  thread_data_array[indice].testVector == NULL)
  {
      exit(EXIT_FAILURE);
  }
  
  if(indice==0)
  {
    memcpy(thread_data_array[indice].testVector, &vectorData[indice], sizeof(float)*numcol);
    memcpy(thread_data_array[indice].trainingMatriz, &vectorData[numcol], sizeof(float)*((numfil-1)*numcol));
  }
  else if(indice>0&&indice<numfil)
  {
    
    memcpy(thread_data_array[indice].testVector, &vectorData[indice*numcol], sizeof(float)*numcol);
    memcpy(thread_data_array[indice].trainingMatriz, vectorData, sizeof(float)*((indice)*numcol));
    memcpy(
      &thread_data_array[indice].trainingMatriz[(indice-1)*numcol+numcol],
      &vectorData[(indice+1)*numcol], sizeof(float)*((numfil-indice-1)*numcol)
    );
  }
  else
  {
    exit(EXIT_FAILURE);
  }
}
/****************************************************************/
void *stddeviation(void *threadid)
{
  float dato1=0;
  long tid;
  tid = (long)threadid;
  int j=0;
  for(j=0; j<numfil-1; j++)
  {
    float dato=(thread_data_array[indice].trainingMatriz[j*numcol+tid]-thread_data_array[indice].meanVector[tid])*(thread_data_array[indice].trainingMatriz[j*numcol+tid]-thread_data_array[indice].meanVector[tid]);
    dato1+= dato;
  }
  thread_data_array[indice].stdVector[tid]=sqrt(dato1/(numfil-2));
  pthread_exit(NULL);
}
/****************************************************************/
void calcularStdTrainingMatriz()
{
  thread_data_array[indice].stdVector=(float*)malloc(sizeof(float)*numcol);
  if(thread_data_array[indice].stdVector==NULL)
  {
    exit(EXIT_FAILURE);
  }
  pthread_t threads[numcol];
   int rc;
   long tid,tid1;
   for(tid=0; tid<numcol-1; tid++){
      rc = pthread_create(&threads[tid], NULL, stddeviation, (void *)tid);
      if (rc){
         exit(-1);
      }
   }
   for(tid1=0; tid1<numcol-1; tid1++)
   {
      pthread_join( threads[tid1], NULL);
   }
}
/****************************************************************/
void calcularpromedioTrainingMatriz()
{
  thread_data_array[indice].meanVector=(float*)malloc(sizeof(float)*numcol);
  if(thread_data_array[indice].meanVector==NULL)
  {
     exit(EXIT_FAILURE);
  }
  pthread_t threads[numcol];
  int rc=0;
  long tid=0,tid1=0;
  for(tid=0; tid<numcol-1; tid++){
    rc = pthread_create(&threads[tid], NULL, promedio, (void *)tid);
    if (rc){
       exit(-1);
    }
  }
  for(tid1=0; tid1<numcol-1; tid1++)
  {
    pthread_join( threads[tid1], NULL);
  }
}

/****************************************************************/
void *normalizarTrainingTestVectors(void *threadid)
{
   long tid;
   tid = (long)threadid;
   int j=0;
   for(j=0; j<(numfil-1); j++)
   {
      thread_data_array[indice].trainingMatriz[j*(numcol)+tid]=thread_data_array[indice].trainingMatriz[j*(numcol)+tid]-thread_data_array[indice].meanVector[tid];
      thread_data_array[indice].trainingMatriz[j*(numcol)+tid]=thread_data_array[indice].trainingMatriz[j*(numcol)+tid]/thread_data_array[indice].stdVector[tid];
   }
   thread_data_array[indice].testVector[tid]=thread_data_array[indice].testVector[tid]-thread_data_array[indice].meanVector[tid];
   thread_data_array[indice].testVector[tid]=thread_data_array[indice].testVector[tid]/thread_data_array[indice].stdVector[tid];
   pthread_exit(NULL);
}
/****************************************************************/
void normalizarTrainingMatrizVectorTest()
{
  pthread_t threads[numcol];
   int rc;
   long tid,tid1;
   for(tid=0; tid<numcol-1; tid++){
      rc = pthread_create(&threads[tid], NULL, normalizarTrainingTestVectors, (void *)tid);
      if (rc){
        exit(-1);
      }
   }
   for(tid1=0; tid1<numcol-1; tid1++)
   {
      pthread_join( threads[tid1], NULL);
   }
}
/****************************************************************/

void *knn_predict(void *threadid)
{
  int j=0;
  long tid;
  float min=INFINITY;
  tid= (long)threadid;
  float *trainingVectorj;
  float *testVector=thread_data_array[tid].testVector;
  float labelminimo; 
  float distance=0;
  for(j=0;j<(numfil-2);j++)
  {

    trainingVectorj= &thread_data_array[tid].trainingMatriz[j*(numcol)] ;
    distance=(* fptr)(testVector,trainingVectorj);
    if(distance<min)
    { 
      min=distance;
      labelminimo =  thread_data_array[tid].labelsTrainingVector[j];
    }
  }
  lineslabels[tid]=labelminimo; 

  pthread_exit(NULL);
  free(thread_data_array[tid].labelsTrainingVector);
  free(thread_data_array[tid].labelSort);
  free(thread_data_array[tid].trainingMatriz);
  free(thread_data_array[tid].testVector);
}

/****************************************************************/

void threadsKNN(int cores)
{
  int particion = numfil / cores; 
  int inicioP;
  int finalP;
  int i=0;

  int residuo=numfil%cores;
  for (i=0; i<=particion; i++ )
  {
    inicioP = i * cores;
    if(residuo==0 && i==particion)
    {
      break;
    }
    else if ( i == particion  )
    {
      finalP = numfil;
    }
    else
    {
      finalP = inicioP + cores;
    }
    pthread_t threads[numfil];
    int rc;
    long tid,tid1;
    for(tid=inicioP; tid<finalP; tid++){
      rc = pthread_create(&threads[tid], NULL,knn_predict, (void *)tid);
      if (rc){
         exit(-1);
      }
    }
    for(tid1=inicioP; tid1<finalP; tid1++)
    {
      pthread_join( threads[tid1], NULL);
    }
  }
}
/*****************************************************************************/
void KNN(int cores)
{
  lineslabels=(float*)malloc(sizeof(float)*numfil);
  if(lineslabels==NULL)
  {
     exit(EXIT_FAILURE);
  }

  struct timespec start, end;
  clock_gettime(CLOCK_MONOTONIC, &start);
  for(indice=0;indice<numfil; indice++)
  {
    obtainTrainingTestVector();
    calcularpromedioTrainingMatriz();
    calcularStdTrainingMatriz();
    findstdVectorCeros();
    obtainlabelsVector();
  }

  clock_gettime(CLOCK_MONOTONIC, &end);
  clock_gettime(CLOCK_MONOTONIC, &start);
  threadsKNN(cores);
  obtainAllLabels();
  clock_gettime(CLOCK_MONOTONIC, &end);
}
/****************************************************************/
const char * main(int cores, int distance, float * file_content, int fil, int col)
{
  char *distancesName[15] = {
    "euclideanDist",
    "manhattanDist",
    "minkowskiDist",
    "canberraDist",
    "lanceWilliamDist",
    "cosineDist",
    "JaccardTanimotoDist",
    "wdmSimilarity",
    "soergelDist",
    "lagrangeDist",
    "chessBoardDist",
    "clarkDist",
    "MatusitaDist",
    "waveEdgesDist",
    "cuadraticDist"
  };
  void *ptrvector[15] = {
    euclideanDist,
    manhattanDist,
    minkowskiDist,
    canberraDist,
    lanceWilliamDist,
    cosineDist,
    JaccardTanimotoDist,
    wdmSimilarity1,
    soergelDist,
    lagrangeDist,
    chessBoardDist,
    clarkDist,
    MatusitaDist,
    waveEdgesDist,
    cuadraticDist
  };
  int md=0;
  int hits=0;
  int i; 
  float accurancy=0;
  static char response[50];

  fptr = ptrvector[distance];
  vectorData = file_content;
  numfil = fil;
  numcol = col;

  thread_data_array=(datastruct*)malloc(sizeof(datastruct)*numfil);

  if(thread_data_array==NULL)
  {
    exit(EXIT_FAILURE);
  }

  KNN(cores);
  for(i=0;i<numfil;i++)
  {
    if(allLabels[i]==lineslabels[i])
    {
      hits=hits+1;
    }
  }
  accurancy=(float)hits/(float)(numfil);

  sprintf(
    response,
    "{'accuracyName': '%s', 'accuracyResult': %f}",
    distancesName[distance],
    accurancy
  );

  return response;
}
