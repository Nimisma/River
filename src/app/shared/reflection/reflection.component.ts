import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-reflection',
  templateUrl: './reflection.component.html',
  styleUrls: ['./reflection.component.scss']
})
export class ReflectionComponent {
  
  @ViewChild('imgCanvas', {static: true}) canvas!: ElementRef<HTMLCanvasElement>;

  @Input() src: string='';
  @Input() width:number = -1;
  @Input() height:number = -1; 
  @Input() waverate:number =  0.38;
  @Input() backcolor:string = '#001817';
  

  private counter:number = 0;

  private intervalID!:number;  

  private rivers:ImageData[] = new Array(10);

  

  ngOnInit(){
    this.width = Math.trunc(this.width);
    this.height = Math.trunc(this.height);
    if(!this.isColor(this.backcolor)) this.backcolor = '#001817';
  }

  isColor(c:string) {
    let s = new Option().style;
    s.color = c;
    return s.color.length > 0;
}

  ngAfterViewInit() { 
    this.showImage(); 
   
  }

  showImage() { 
    const img:HTMLImageElement=new Image();

    img.src=this.src;

    img.onload = (() => this.imageLoad(img));

  }

  setSize(img: HTMLImageElement) {
    if ((this.width < 0) && (this.height < 0)) {
      if (this.width < 0) this.width = img.width;
      if (this.height < 0) this.height = img.height;
    } else if (this.width < 0) {
      this.width = Math.trunc(img.width*(this.height/img.height));
    } else if (this.height < 0) {
      this.height = Math.trunc(img.height*(this.width/img.width));
    } 

    this.canvas.nativeElement.width = this.width;
    this.canvas.nativeElement.height = Math.trunc(1.5*this.height);
    this.canvas.nativeElement.style.backgroundColor = this.backcolor; // for Transparency
  }

  imageLoad(img: HTMLImageElement) {
    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.setSize(img);
    console.log(img.src + "w: " + img.width)

    ctx.drawImage(img, 0, 0, this.width, this.height);
 
    this.prepareRiver();

    this.intervalID = window.setInterval(() => this.riverImg(), 80);
  }

  public method(): number {

    const p: unknown = 3;

    if(typeof p === 'number' ) {
      return p;
    }

    return 0;

  }


  riverImg(): void {
    this.counter++;
    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) return;

    ctx.putImageData(this.rivers[this.counter%10], 0, this.height);
  }


  private prepareRiver ():void
	{
    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const data = ctx.getImageData(0,0,this.width,this.height).data;

    let diff:number = 0;
    let move:number = 0; 
    let a:number = 1;

    let buffer:number[] = new Array(this.width * Math.trunc(this.height/2)*4).fill(0);

    //create an array of 10 images
    for (let r = 0, i = 0; r < 2*Math.PI; r += Math.PI / 5, i++) {  

      // y = 2c
			for (let c=0; c < this.height/2 ; c++) {

        let y = 2*c;

        a = Math.cos(Math.PI + Math.PI*((this.height-y)/this.height)/2) + 1;
        diff = Math.sin((r + this.waverate*(this.height-y)*(Math.PI / 6)));
        

        //make sure that there is a smooth transition at the reflection line
        if (y > (4*this.height/5)) {
          diff = diff*Math.sin(((-1*(y+2)*5/this.height) + 5)*(Math.PI/2)) ; 
       }

				move = Math.round(diff*(2.2*a*a*a*(this.height/4) + 5));

        
        for (let x=0;x<this.width;x++) {

					if (((x + move) < 0)  || ((x + move) >= this.width) ) {           
           move = 0;
					} 

          let m = Math.trunc((this.height-y)/2);
          m = Math.trunc(this.height/2) - c - 1;

          //get color value from offset point
          buffer[(x + m*this.width)*4] = data[(x + move + y*this.width)*4];  //R
          buffer[1+(x + m*this.width)*4] = data[1+(x + move + y*this.width)*4];  //G
          buffer[2+(x + m*this.width)*4] = data[2+(x + move + y*this.width)*4]; //B

          // Make it darker towards the bottom of the canvas, 
          // therefore make the image more transparent 
          // so the dark background will shine through.
          buffer[3+(x + m*this.width)*4] = Math.trunc((200/this.height)*y + 55);  // alpha value (Transparency)
        }
       }

       let idata = ctx.createImageData(this.width, Math.trunc(this.height/2));

        // set our buffer as source
        idata.data.set(buffer);

        this.rivers[i] = idata;
		}
	}

}
