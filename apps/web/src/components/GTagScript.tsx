// Google tag (gtag.js) 
export function GTagScript() {
  return (
    <>  
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-GL9J0G7KT5"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
      
        gtag('config', 'G-GL9J0G7KT5');
      </script>
    </>
  );
}
