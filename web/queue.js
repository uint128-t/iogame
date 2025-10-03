var projectileI=0;
var projectileN=0;
var projectileX=[0]*1000;
void addProjectile(x){
    if (projectileN==1000){
        popProjectile();
    }
    projectileN++;
    projectileX[(projectileN+projectileI)%1000]=X;
}
void popProjectile(){
    projectileI=(projectileI+1)%1000;
    projectileN--;
}