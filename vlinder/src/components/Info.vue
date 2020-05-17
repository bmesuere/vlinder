<template>
    <div style="height: 100%">
        <b-card style="margin: 3% 5% 5% 4%">
            <div class="title"><h2>Doel van het VLINDER-project</h2></div>
            <div class="intro"><b>Weer en klimaat zijn van groot belang in onze hedendaagse maatschappij. Krachtigere supercomputers laten toe om steeds nauwkeurigere weersvoorspellingen te maken en daarvoor worden lokale weersmetingen steeds belangrijker. Bij dit unieke citizen science project monitoren Vlaamse scholen, onderzoekers en lokale partners met een netwerk van 58 weerstations het weer in omgevingen waar we vandaag nog geen data hebben.</b></div>
            <div class="image-block">
                <b-img class="image" :src="`${publicPath}info_fotos/vlinder17.jpeg`"/>
                <div class="image-desc"> Leerlingen van het Sint-Augustinusinstituut (Bree) zijn net klaar met het installeren van VLINDER-weerstation 17 in Oudsbergen. </div>
            </div>
            <div class="body"><span>Landgebruik (bv. bebouwing,groen,...) heeft een invloed op de atmosfeer. Met de steeds hogere resolutie van atmosferische modellen wordt het belangrijk om een beter begrip van deze interactie te krijgen. Maar betrouwbare weerswaarnemingen beperken zich meestal tot weerstations in zeer open en rurale omgevingen. Het VLINDER project, operationeel sinds december 2019, wil hier verandering in brengen en in Vlaanderen een meetnetwerk opzetten waarbij gemeten wordt in zeer uiteenlopende omgevingen (landelijk, stadscentra, industriele sites, bossen,...). Het is onbegonnen werk om dit als onderzoekers op zulke schaal zelf te organiseren. Vandaar dat het VLINDER project beroep doet op scholen om weerstations te plaatsen in de meest uiteenlopende omgevingen die Vlaanderen en Brussel rijk zijn. De leerlingen van de deelnemende scholen zullen doorheen het hele project betrokken worden: zoeken geschikte locaties, bouwen weerstation, onderzoeken metingen, lessen rond weer en klimaat,...</span></div>
            <div class="body"><span>Het VLINDER project wordt gefinancieerd door het Departement EWI binnen de oproep omtrent citizen science. Om het project zo succesvol mogelijk te maken wordt het project gedragen door verschillende partners met uitgebreide wetenschappelijke, technologische en/of educationele expertise.</span></div>
            
            <div class="title"><h2>Meetnetwerk VLINDER</h2></div>
                <div class="image-block">
                    <b-img class="image" :src="`${publicPath}info_fotos/vlindernetwerk.png`"/>
                    <div class="image-desc"> Overzichtskaart met de 58 VLINDER locaties in Vlaanderen en Brussel. </div>
                </div>
                <div class="body"><span>
                    Vandaag telt het VLINDER meetnetwerk 58 meetpunten in zeer uiteenlopende landschappen. De meetlocaties zijn zo gekozen dat alle landschappen die we in Vlaanderen en Brussel vinden, vertegenwoordigd zijn. Sommige VLINDER meetpunten bevinden zich in sterk verstedelijkte en industriele omgevingen. Maar er bevinden zich eveneens weerstations in duinen, bossen en meren. Heel wat locaties zijn tot stand gekomen dankzij samenwerkingen tussen scholen, lokale overheid en bedrijven.
                </span></div>

            <div class="title"><h2>Het VLINDER-weerstation</h2></div>
                <div class="image-block">
                    <b-img class="image" :src="`${publicPath}info_fotos/vlinder53.jpeg`"/>
                    <div class="image-desc"> VLINDER-weerstation 53 op de Poelberg (Tielt) geplaatst en opgevolgd door VTI Tielt. </div>
                </div>
                <div class="body"><span>
                    Voor de metingen wordt gebruik gemaakt van een nauwkeurig weerstation dat samengesteld is door de UGent. De meteorologische sensoren (Davis Vantage Pro 2) zijn hoogwaardig en meten temperatuur, relatieve vochtigheid, wind en neerslag. Voor de communicatie wordt gebruik gemaakt van de nieuwste Internet of Things (IoT) technologie. De stroom wordt geleverd door een zonnepaneel met batterijsysteem en is zo berekend dat het weerstation op een volle batterij ongeveer 1 maand verder kan. Een microcontroller van het Arduino type wordt gebruikt om het meetstation aan te sturen. Het weerstation is zo ontwikkeld dat de leerlingen het helemaal zelf kunnen opbouwen en plaatsen.
                </span></div>

            <div class="title"><h2>Over deze website</h2></div>
                        <div class="body"><span>
                            De website werd ontworpen in verband met het vak Datavisualisatie aan UGent. 
                            Hiervoor ontwierpen wij niet alleen de site en de daarbijhorende visualities, maar ook een API die voor ons de VLINDER-data kan verwerken en in een bruikbaar formaat naar ons kan doorsturen.
                        </span></div>


                        <div class="post"><span>
                            Voor meer informatie kan men ook terecht op de hoofdwebsite van het <a href=http://vlinder.ugent.be>VLINDER-project</a>.
                        </span></div>



            </b-card>
    </div>
</template>

<script>
    export default {
        name: "Info",
        data() {
            return {
                publicPath: process.env.BASE_URL
            }
        }
    }
</script>

<style scoped>

h2 {
    color: #35495e;
}

.intro {
    padding-bottom: 20px;
}

.body {
    padding-bottom: 25px;
}

.post {
    color: grey;

}

.image {
    width: 50%;
}

.image-block {
    text-align: center;
    padding: 0 3% 3% 3%;
}

.image-desc {
    padding-top: 3px;
    color: grey;
    font-size: 13px;
    font-weight: italic;
}

</style>