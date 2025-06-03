declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | [number, number, number, number]
    filename?: string
    image?: {
      type?: string
      quality?: number
    }
    html2canvas?: {
      scale?: number
      useCORS?: boolean
      letterRendering?: boolean
      allowTaint?: boolean
      backgroundColor?: string
      logging?: boolean
      width?: number
      height?: number
    }
    jsPDF?: {
      unit?: string
      format?: string
      orientation?: string
      putOnlyUsedFonts?: boolean
      floatPrecision?: number
    }
  }

  interface Html2Pdf {
    set(options: Html2PdfOptions): Html2Pdf
    from(element: HTMLElement): Html2Pdf
    save(): Promise<void>
  }

  function html2pdf(): Html2Pdf
  export default html2pdf
} 