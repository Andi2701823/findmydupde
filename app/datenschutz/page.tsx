import {supportEmail} from "@/lib/site-contact";
import type { Metadata } from "next";
export const metadata: Metadata = {title:"Datenschutzerklärung",description:"Informationen zur Verarbeitung personenbezogener Daten auf FindMyDup.",alternates:{canonical:"https://findmydup.de/datenschutz/"}};
export default function Privacy(){return <main id="main" className="shell legal-page">
  <span className="eyebrow">DEINE DATEN IM BLICK</span>
  <h1>Datenschutzerklärung</h1>
  <p>Diese Datenschutzhinweise erläutern, welche Daten bei der Nutzung von FindMyDup verarbeitet werden. Die Website bietet aktuell frei lesbare Einkaufsratgeber, eine Suchfunktion für redaktionelle Inhalte und eine lokale Merkliste.</p>
  <h2>1. Verantwortlicher</h2>
  <p>Andreas Paul<br/>Germersheimer Straße 17<br/>70499 Stuttgart<br/>Deutschland<br/>E-Mail: <a href={"mailto:"+supportEmail}>{supportEmail}</a></p>
  <h2>2. Bereitstellung der Website und Hosting</h2>
  <p>Beim Abruf unserer Website werden technisch notwendige Daten übertragen, darunter IP-Adresse, Zeitpunkt der Anfrage, aufgerufene URL, Browserinformationen und technische Statuscodes. Diese Informationen können auf den Servern unseres Hosting-Anbieters Hostinger zur Auslieferung, Absicherung und Fehleranalyse verarbeitet werden.</p>
  <p>Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einem sicheren und funktionsfähigen Internetauftritt). Die konkrete Aufbewahrungsdauer von Serverprotokollen richtet sich nach den Einstellungen und Verfahren des Hosting-Anbieters. Auf Anfrage geben wir Auskunft zu den bei uns verfügbaren Einzelheiten.</p>
  <h2>3. Ratgebersuche</h2>
  <p>Die Suche durchsucht die auf dieser Website veröffentlichten Einkaufsratgeber in deinem Browser. Der Suchbegriff kann Bestandteil der Seitenadresse werden und dadurch im Browserverlauf oder in technischen Serverprotokollen auftauchen. Bitte gib keine vertraulichen personenbezogenen Informationen in die Suche ein.</p>
  <h2>4. Merkliste und lokaler Speicher</h2>
  <p>Wenn du einen Ratgeber merkst, speichern wir dessen Kennung ausschließlich im lokalen Speicher deines Browsers (Schlüssel „findmydup:favorites“). Die Daten werden nicht an unseren Server übertragen. Die Speicherung dient der von dir gewünschten Merkfunktion. Du kannst einen Eintrag durch erneutes Anklicken des Herzsymbols entfernen oder den lokalen Speicher in deinen Browsereinstellungen löschen.</p>
  <h2>5. Kontaktaufnahme</h2>
  <p>Wenn du uns eine E-Mail schreibst, verarbeiten wir deine Kontaktdaten und den Nachrichteninhalt, um deine Anfrage zu beantworten. Rechtsgrundlage ist je nach Anliegen Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche oder vertragliche Kommunikation) oder Art. 6 Abs. 1 lit. f DSGVO (Bearbeitung sonstiger Anfragen). Wir bewahren Nachrichten nur so lange auf, wie es für den jeweiligen Zweck und mögliche gesetzliche Aufbewahrungspflichten erforderlich ist.</p>
  <h2>6. Analyse, Werbung und externe Produktdienste</h2>
  <p>Unsere Beauty-Produktseite und die Produktauswahl auf der Startseite laden Produktbilder von bdr-beauty.com. Dabei stellt der Browser technisch eine Verbindung zum Server des Händlers her; hierbei können insbesondere IP-Adresse und Browserinformationen übertragen werden. Grundlage hierfür ist unser berechtigtes Interesse an der Präsentation echter Händlerprodukte (Art. 6 Abs. 1 lit. f DSGVO). Die Bilder sind nicht Bestandteil der rein redaktionellen Ratgeber. Affiliate-Links sind als Werbelinks gekennzeichnet und führen beim Klick über das Netzwerk Awin zu Händlerangeboten. Dabei können Awin und der Händler eigene Datenverarbeitungen, etwa zur Zuordnung von Käufen und Provisionen, vornehmen. Beachte dazu die Datenschutzhinweise des jeweiligen Dienstes. Wir betreiben auf unserer Website derzeit keine eigene KI-Bildanalyse und binden kein zusätzliches Analyse-Pixel ein. Bei neuen Diensten aktualisieren wir diese Hinweise.</p>
  <h2>7. Deine Rechte</h2>
  <p>Im Rahmen der gesetzlichen Voraussetzungen kannst du Auskunft über deine gespeicherten personenbezogenen Daten, Berichtigung, Löschung, Einschränkung der Verarbeitung und Datenübertragbarkeit verlangen. Du kannst außerdem einer Verarbeitung nach Art. 6 Abs. 1 lit. f DSGVO aus Gründen deiner besonderen Situation widersprechen. Sofern eine Verarbeitung auf Einwilligung beruht, kannst du diese für die Zukunft widerrufen. Wende dich dazu an die oben genannte E-Mail-Adresse.</p>
  <p>Du hast das Recht, dich bei einer Datenschutzaufsichtsbehörde zu beschweren, etwa beim Landesbeauftragten für den Datenschutz und die Informationsfreiheit Baden-Württemberg.</p>
  <h2>8. Aktualisierung</h2>
  <p>Wir aktualisieren diese Hinweise bei Änderungen unserer Website oder der eingesetzten Dienste. Stand: 14. Oktober 2026.</p>
</main>;}
