/**
 * @file A collection of yaml string to demonstrate the slides.
 */

const marmotte = `
---
slides:

- person:
    image: id:Beethoven

- person:
    image: id:Goethe

- markdown: |
    Beethovens frühe Jahre in Bonn verliefen sehr ungeordnet. Eine
    Schulbildung im heutigen Sinn genoss er nicht; aber er war ungemein
    wissbegierig und sog auf, was er kennenlernte. Dazu gehörten auch Werke
    Goethes, dem bedeutendsten Dichter seiner Zeit. An ihn schrieb er
    später: _„Seit meiner Kindheit kenne ich Sie“_. Beethovens Verehrung für
    den Dichter hat sich in mehreren Werken niedergeschlagen, zum ersten Mal
    in einem kleinen Lied. Es ist vermutlich 1790, noch in Bonn, entstanden.
    Der Text stammt aus Goethes wenig bekanntem Schwank _„Das Jahrmarktsfest
    zu Plundersweilern“_.

    Zwei Kinder treten auf. Sie kommen aus Savoyen, einer damals bitterarmen
    Gegend in den französischen Alpen. Um zu überleben, zogen viele
    _„Savoyardenkinder“_ bettelnd durch die Lande, sangen (oft zur
    Dudelsackbegleitung) Lieder. Als _„Attraktion“_ führten sie in einem
    Kasten ein Murmeltier mit sich, das zur Musik _„tanzte“_.

- image: filename:Savoyarde-mit-Murmeltier.jpg
- image: filename:Foto-Savoyarden-Musikanten-mit-Murmeltier.jpg
- image: id:Landkarte-Savoien

- question: |
    Untersucht die Klavierbegleitung. Inwiefern weist sie auf das begleitende
    Instrument der Savoyardenkinder hin?

- question: Hört das Lied und diskutiert über die Interpretation!

- audio: filename:Fischer-Dieskau_Marmotte.m4a
`

export default {
  marmotte
}
