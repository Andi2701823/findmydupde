export type GuideCategory = "Mode" | "Beauty" | "Wohnen" | "Technik";
export interface Guide {
  slug: string;
  category: GuideCategory;
  title: string;
  excerpt: string;
  keywords: string[];
  readMinutes: number;
  sections: { heading: string; paragraphs: string[]; tips?: string[] }[];
}
export const guideCategories: GuideCategory[] = ["Mode", "Beauty", "Wohnen", "Technik"];
export const guides: Guide[] = [
  {
    slug: "gesichtsserum-vergleichen", category: "Beauty",
    title: "Gesichtsserum vergleichen: Inhaltsstoffe statt Werbeversprechen",
    excerpt: "Woran du unterschiedliche Seren erkennst und welche Fragen vor dem Kauf sinnvoll sind.",
    keywords: ["serum", "gesichtspflege", "hautpflege", "skincare", "niacinamid", "hyaluron", "kosmetik"],
    readMinutes: 5,
    sections: [
      { heading: "Was soll das Serum leisten?", paragraphs: [
        "Ein Serum ist keine fest definierte Produktklasse. Manche Produkte sind dünnflüssige Feuchtigkeitspflege, andere enthalten stärker konzentrierte Wirkstoffe. Deshalb hilft es wenig, zwei Seren nur anhand von Verpackung, Markenname oder Preis zu vergleichen. Entscheidend ist, welche Funktion das Produkt in deiner persönlichen Pflegeroutine erfüllen soll.",
        "Für trockene Haut sind feuchtigkeitsspendende Formulierungen interessant. Bei empfindlicher Haut lohnt es sich besonders, die vollständige Inhaltsstoffliste zu lesen und neue Produkte vorsichtig einzuführen. Eine auffällige Verpackung oder ein hoher Preis sagen für sich genommen nichts über die Verträglichkeit aus."
      ] },
      { heading: "Inhaltsstoffliste richtig einordnen", paragraphs: [
        "Kosmetische Inhaltsstoffe sind in der INCI-Liste aufgeführt. Die Reihenfolge hilft bei der groben Einordnung: Inhaltsstoffe oberhalb von einem Prozent stehen in absteigender Reihenfolge ihrer Menge. Unterhalb dieser Grenze kann die Reihenfolge abweichen. Die Liste allein verrät allerdings weder die exakte Konzentration jedes Stoffes noch die Wirksamkeit der fertigen Rezeptur.",
        "Bekannte Namen wie Hyaluronsäure, Glycerin oder Niacinamid können einen ersten Hinweis geben, sind aber keine Garantie für eine bestimmte Wirkung. Achte zugleich auf Duftstoffe, die für dich persönlich unverträglich sein könnten."
      ], tips: ["Zuerst den gewünschten Pflegezweck notieren.", "INCI-Liste statt nur Produktname vergleichen.", "Menge pro Packung und Preis pro 10 ml berücksichtigen.", "Bei empfindlicher Haut die Verträglichkeit besonders beachten."] },
      { heading: "Wann ist ein Angebot wirklich günstiger?", paragraphs: [
        "Vergleiche nicht allein den Packungspreis. Ein 15-ml-Serum kann auf den ersten Blick günstig erscheinen, aber pro Milliliter mehr kosten als ein größeres Produkt. Wichtig sind außerdem Versandkosten, Rückgabebedingungen und die tatsächlich benötigte Menge. Für die endgültigen Angaben gelten die Informationen im jeweiligen Shop.",
        "Zwei Seren mit ähnlicher Farbe oder einer vergleichbaren Glasflasche sind keine austauschbaren Produkte. Inhaltsstoffe, Konzentrationen und individuelle Verträglichkeit können deutlich unterschiedlich sein."
      ] }
    ]
  },
  {
    slug: "sonnenschutz-kaufen", category: "Beauty",
    title: "Sonnenschutz kaufen: Auf diese Angaben kommt es an",
    excerpt: "LSF, UVA-Schutz, Anwendung und Hautgefühl: So liest du Produktangaben besser.",
    keywords: ["sonnenschutz", "sonnencreme", "spf", "lsf", "uva", "beauty", "pflege"],
    readMinutes: 4,
    sections: [
      { heading: "LSF und UVA sind nicht dasselbe", paragraphs: [
        "Der Lichtschutzfaktor, kurz LSF, bezieht sich vor allem auf den Schutz vor UVB-Strahlung. UVA-Schutz ist eine weitere wichtige Produkteigenschaft. Bei Sonnenschutzprodukten lohnt deshalb der Blick auf die vollständige Kennzeichnung und nicht nur auf eine große Zahl auf der Vorderseite.",
        "Ein höherer LSF ersetzt keine sorgfältige Anwendung. Die aufgedruckten Schutzwerte beruhen auf einer definierten Auftragsmenge, die im Alltag oft unterschritten wird."
      ] },
      { heading: "Was bedeutet alltagstauglich?", paragraphs: [
        "Ein Produkt, das du angenehm findest und ausreichend aufträgst, passt möglicherweise besser in deinen Alltag als ein theoretisch ideales Produkt, das ungenutzt im Schrank steht. Unterschiede bestehen etwa bei Textur, Glanz, Duft, Wasserbeständigkeit und Verträglichkeit.",
        "Wasserbeständigkeit bedeutet nicht, dass nach Schwimmen, Abtrocknen oder längerem Aufenthalt draußen kein Nachcremen nötig wäre. Beachte immer die Anwendungshinweise des Herstellers."
      ], tips: ["LSF und UVA-Kennzeichnung prüfen.", "Genügende Menge einplanen und regelmäßig nachcremen.", "Bei Aktivität im Wasser auf die angegebenen Eigenschaften achten.", "Preis pro 100 ml einschließlich Versand vergleichen."] },
      { heading: "Vergleiche die Gesamtkosten", paragraphs: [
        "Eine kleine Reisegröße kann pro 100 ml erheblich teurer sein. Berücksichtige Packungsgröße, tatsächliche Verfügbarkeit und Lieferkosten. Wichtig: Sonnenschutz ist eine Gesundheitsmaßnahme, kein Bereich für unbelegte Ähnlichkeits- oder Wirkversprechen."
      ] }
    ]
  },
  {
    slug: "handtasche-kaufen", category: "Mode",
    title: "Handtaschen vergleichen: Form, Material und Alltagstauglichkeit",
    excerpt: "Ein ähnlicher Look ist schnell gefunden. Doch entscheidend sind Verarbeitung und Nutzung.",
    keywords: ["handtasche", "tasche", "bag", "leder", "schultertasche", "mode", "accessoires"],
    readMinutes: 4,
    sections: [
      { heading: "Erst den Einsatz festlegen", paragraphs: [
        "Bevor du Handtaschen miteinander vergleichst, überlege, was wirklich hineinmuss. Eine kleine Schultertasche für den Abend und eine Tasche für Arbeit oder Studium erfüllen sehr unterschiedliche Zwecke. Maße in Zentimetern helfen stärker als Fotos, die die Größe oft schlecht erkennen lassen.",
        "Prüfe die Länge und Verstellbarkeit des Riemens, das Eigengewicht und die Zahl der Fächer. Ein Reißverschluss kann im Alltag praktischer sein als ein offenes Hauptfach."
      ] },
      { heading: "Material und Verarbeitung", paragraphs: [
        "Bei echtem Leder, beschichteten Textilien und Kunstleder unterscheiden sich Pflegebedarf und Alterungsverhalten. Die Materialbezeichnung sollte möglichst konkret sein. Ein ähnlicher Farbton oder ein vergleichbarer Schnitt bedeutet nicht dieselbe Materialqualität.",
        "Nähte, Beschläge, Futter und Trägeransätze sind oft aussagekräftiger als dekorative Details. Lies auch Hinweise zur Pflege und zur zulässigen Belastung."
      ], tips: ["Innen- und Außenmaße vergleichen.", "Gewicht und Riemenlänge prüfen.", "Materialangabe und Pflegehinweise lesen.", "Versand, Rückgabe und tatsächlichen Endpreis einbeziehen."] },
      { heading: "Stil ist nicht gleich Qualität", paragraphs: [
        "Günstigere Alternativen können ähnliche Designmerkmale haben, aber bei Haltbarkeit, Verarbeitung oder Ausstattung abweichen. Ein fairer Vergleich beschreibt Gemeinsamkeiten und Unterschiede, statt Produkte als identisch darzustellen."
      ] }
    ]
  },
  {
    slug: "sneaker-vergleichen", category: "Mode",
    title: "Sneaker vergleichen: Passform vor Preis",
    excerpt: "Größentabelle, Dämpfung, Obermaterial und Rückgabe entscheiden mit.",
    keywords: ["sneaker", "schuhe", "turnschuhe", "größe", "passform", "mode"],
    readMinutes: 4,
    sections: [
      { heading: "Die richtige Größe finden", paragraphs: [
        "Schuhgrößen können je nach Hersteller und Modell unterschiedlich ausfallen. Nutze möglichst die Größentabelle des konkreten Modells und beachte Angaben zur Fußlänge. Rezensionen können Hinweise geben, ersetzen aber keine eigene Passformprüfung.",
        "Für den Alltag sind Zehenfreiheit, Fersenhalt und ein angenehmes Tragegefühl wichtiger als die Ähnlichkeit mit einem beliebten Trendmodell."
      ] },
      { heading: "Materialien und Nutzung", paragraphs: [
        "Leder, Textil und synthetische Obermaterialien unterscheiden sich in Gewicht, Pflege und Verhalten bei Nässe. Auch Profil, Sohlenkonstruktion und Dämpfung spielen eine Rolle. Ein optisch ähnlicher Schuh kann sich beim Gehen völlig anders anfühlen.",
        "Vergleiche daher nicht nur Produktfotos. Lies die Material- und Pflegeangaben und prüfe, ob der Schuh für deine geplante Nutzung geeignet ist."
      ], tips: ["Modellspezifische Größentabelle lesen.", "Material und Pflegeaufwand berücksichtigen.", "Rückgabebedingungen vor der Bestellung prüfen.", "Endpreis inklusive Versand vergleichen."] },
      { heading: "Rückgabe ist Teil des Vergleichs", paragraphs: [
        "Gerade bei Schuhen ist eine unkomplizierte Rückgabe wichtig. Prüfe Fristen, Kosten und Bedingungen vor der Bestellung. Ein etwas niedrigerer Preis ist nicht automatisch das bessere Angebot, wenn Rücksendungen deutlich teurer sind."
      ] }
    ]
  },
  {
    slug: "tischleuchten-vergleichen", category: "Wohnen",
    title: "Tischleuchten vergleichen: Licht, Größe und Stromverbrauch",
    excerpt: "Warum nicht allein die Form entscheidet, sondern auch Leuchtmittel und Einsatzort.",
    keywords: ["lampe", "tischlampe", "licht", "leuchte", "led", "wohnen", "design"],
    readMinutes: 4,
    sections: [
      { heading: "Wo soll die Leuchte stehen?", paragraphs: [
        "Eine dekorative Leuchte am Sideboard hat andere Aufgaben als eine Lampe zum Lesen oder Arbeiten. Berücksichtige die Höhe, den Platz auf dem Möbelstück und die Richtung des Lichts. Bilder vermitteln die tatsächlichen Maße oft nur unzureichend.",
        "Für gerichtetes Leselicht ist die Ausleuchtung besonders wichtig. Bei Stimmungslicht zählen eher Lichtfarbe, Dimmbarkeit und Blendfreiheit."
      ] },
      { heading: "Lichttechnische Angaben", paragraphs: [
        "Lumen beschreibt den Lichtstrom, Watt die elektrische Leistung. Für die Wahrnehmung des Lichts sind außerdem Lichtverteilung und Farbtemperatur entscheidend. Kelvinangaben helfen, warmes von neutralerem Licht zu unterscheiden.",
        "Prüfe, ob ein Leuchtmittel enthalten, austauschbar oder fest verbaut ist. Bei integrierten LEDs sind Angaben zur Lebensdauer und zur Reparierbarkeit besonders relevant."
      ], tips: ["Höhe, Durchmesser und Kabellänge prüfen.", "Lumen, Kelvin und Dimmbarkeit vergleichen.", "Austauschbarkeit des Leuchtmittels beachten.", "Energieinformationen und Gesamtkosten betrachten."] },
      { heading: "Sicherheitsangaben beachten", paragraphs: [
        "Verwende Leuchten nur entsprechend ihrer Kennzeichnung und Anleitung. Für Badezimmer oder Außenbereiche können besondere Schutzarten nötig sein. Eine ähnlich aussehende Leuchte ist nicht zwangsläufig für denselben Einsatzort geeignet."
      ] }
    ]
  },
  {
    slug: "sessel-kaufen", category: "Wohnen",
    title: "Sessel kaufen: Komfort lässt sich nicht vom Bild ablesen",
    excerpt: "Sitzhöhe, Tiefe, Bezug und Lieferbedingungen vor dem Kauf sinnvoll prüfen.",
    keywords: ["sessel", "stuhl", "möbel", "wohnen", "polster", "loungesessel"],
    readMinutes: 4,
    sections: [
      { heading: "Maße vor dem Design", paragraphs: [
        "Ein Sessel kann auf Fotos großzügig wirken und im tatsächlichen Raum zu groß sein. Miss Stellfläche, Sitzhöhe und Sitztiefe nach. Denke an ausreichend Platz zum Aufstehen und an Türen oder Treppenhäuser, durch die das Möbelstück transportiert werden muss.",
        "Auch Armlehnenhöhe und Rückenstütze sind wichtig. Ob ein Sessel bequem ist, hängt von Körpergröße, Haltung und persönlichen Vorlieben ab."
      ] },
      { heading: "Bezug und Pflege", paragraphs: [
        "Material, Abriebfestigkeit und Reinigungshinweise sind im Alltag mindestens so entscheidend wie die Farbe. Abnehmbare Bezüge können praktisch sein, sind aber nicht bei allen Polstermöbeln vorgesehen. Prüfe die Herstellerangaben.",
        "Achte außerdem auf Traglast, Gestell und Montageaufwand. Möbel mit ähnlicher Silhouette können sich in Stabilität und Verarbeitung erheblich unterscheiden."
      ], tips: ["Raum und Transportweg genau ausmessen.", "Sitzhöhe und -tiefe mit vorhandenen Möbeln vergleichen.", "Reinigung und Materialangaben lesen.", "Lieferkosten, Montage und Rückgabe einkalkulieren."] },
      { heading: "Der tatsächliche Endpreis", paragraphs: [
        "Bei sperrigen Möbeln können Speditionskosten, Montage oder Rücktransport erheblich sein. Vergleiche deshalb den Preis inklusive Lieferbedingungen und prüfe, bis wohin die Lieferung erfolgt."
      ] }
    ]
  },
  {
    slug: "kopfhoerer-vergleichen", category: "Technik",
    title: "Kopfhörer vergleichen: Klang, Komfort und Funktionen",
    excerpt: "Was bei Over-Ear-Kopfhörern jenseits des Datenblatts zählt.",
    keywords: ["kopfhörer", "headphones", "bluetooth", "anc", "audio", "technik"],
    readMinutes: 5,
    sections: [
      { heading: "Welche Nutzung steht im Vordergrund?", paragraphs: [
        "Für Videokonferenzen sind Mikrofonqualität und Verbindungssicherheit oft wichtiger als besonders kräftiger Bass. Auf Reisen sind Gewicht, Transportmaß und Geräuschunterdrückung relevant. Bei stundenlangem Tragen ist der Komfort entscheidend.",
        "Over-Ear, On-Ear und In-Ear unterscheiden sich deutlich beim Tragegefühl. Eine ähnliche Form ist deshalb kein Hinweis auf gleichwertige Technik."
      ] },
      { heading: "Funktionen einordnen", paragraphs: [
        "Aktive Geräuschunterdrückung (ANC) kann Umgebungslärm reduzieren, aber nicht jedes Geräusch gleichermaßen. Die Wirksamkeit hängt unter anderem von der Bauweise und der Art des Lärms ab.",
        "Prüfe Akkulaufzeit, Ladeanschluss, Multipoint-Unterstützung, Kabelbetrieb und die Verfügbarkeit von Ersatzpolstern. Marketingbegriffe wie 'Hi-Fi' ersetzen keine nachvollziehbaren technischen Angaben."
      ], tips: ["Komfort und Anpressdruck berücksichtigen.", "Akkulaufzeit mit aktiviertem ANC beachten.", "Mikrofon und Verbindungen passend zur Nutzung auswählen.", "Ersatzteile, Garantie und Rückgabe prüfen."] },
      { heading: "Preisvergleiche richtig lesen", paragraphs: [
        "Beachte Modellnummer und Generation. Eine ähnlich benannte Variante kann weniger Funktionen haben. Preisangaben sollten zum exakt gleichen Modell gehören und Versandkosten mit einbeziehen."
      ] }
    ]
  },
  {
    slug: "powerbank-kaufen", category: "Technik",
    title: "Powerbank kaufen: Kapazität und Ladeleistung verstehen",
    excerpt: "mAh, Wh, USB-C und Schnellladen verständlich erklärt.",
    keywords: ["powerbank", "akku", "laden", "usb-c", "mah", "wh", "technik"],
    readMinutes: 4,
    sections: [
      { heading: "mAh ist nicht die ganze Geschichte", paragraphs: [
        "Die Milliamperestunden-Angabe (mAh) allein sagt nicht aus, wie häufig dein Smartphone vollständig geladen werden kann. Für einen Vergleich ist auch die Energie in Wattstunden (Wh) wichtig. Durch Spannungswandlung und Wärmeverluste kommt nicht die gesamte gespeicherte Energie am Endgerät an.",
        "Überprüfe die Herstellerangaben zur Kapazität und vergleiche Produkte möglichst anhand derselben Bezugsgröße."
      ] },
      { heading: "USB-C und Ladeleistung", paragraphs: [
        "USB-C beschreibt zunächst den Steckertyp, nicht automatisch eine bestimmte Ladegeschwindigkeit. Für schnelles Laden müssen Powerbank, Kabel und Endgerät zueinander passen. Achte auf die unterstützten Ladeprotokolle und die angegebene Ausgangsleistung in Watt.",
        "Falls mehrere Geräte zugleich geladen werden, kann sich die maximale Leistung auf die Ausgänge verteilen. Prüfe die entsprechende Angabe des Herstellers."
      ], tips: ["Wh-Angabe zusätzlich zu mAh prüfen.", "Ausgangsleistung und Ladeprotokolle vergleichen.", "Gewicht und Abmessungen berücksichtigen.", "Für Flugreisen die Bestimmungen der Airline prüfen."] },
      { heading: "Sicherer Umgang", paragraphs: [
        "Nutze unbeschädigte Geräte und passende Kabel. Beschädigte oder auffällig überhitzende Akkus sollten nicht weiterverwendet werden. Beachte Herstellerhinweise zur Lagerung und Entsorgung."
      ] }
    ]
  }
];
export function findGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}
export function searchGuides(query: string, category?: string) {
  const terms = query.trim().toLocaleLowerCase("de").split(/\s+/).filter(Boolean);
  return guides.filter((guide) => {
    if (category && guide.category !== category) return false;
    if (!terms.length) return true;
    const corpus = [guide.title, guide.category, guide.excerpt, ...guide.keywords,
      ...guide.sections.flatMap((section) => [section.heading, ...section.paragraphs])]
      .join(" ").toLocaleLowerCase("de");
    return terms.every((term) => corpus.includes(term));
  });
}
