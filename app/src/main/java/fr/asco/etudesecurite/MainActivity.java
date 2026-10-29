package fr.asco.etudesecurite;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.core.content.FileProvider;
import androidx.webkit.WebViewAssetLoader;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

public class MainActivity extends Activity {

    private static final String ACCUEIL = "https://appassets.androidplatform.net/assets/www/index.html";
    private static final int REQ_FICHIER = 42;

    private WebView web;
    private ValueCallback<Uri[]> retourFichier;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        web = new WebView(this);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);
        s.setTextZoom(100);

        final WebViewAssetLoader chargeur = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) {
                return chargeur.shouldInterceptRequest(r.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                if ("appassets.androidplatform.net".equals(u.getHost())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) { }
                return true;
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams params) {
                if (retourFichier != null) retourFichier.onReceiveValue(null);
                retourFichier = cb;
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("image/*");
                try {
                    startActivityForResult(Intent.createChooser(i, "Choisir une image"), REQ_FICHIER);
                } catch (Exception e) {
                    retourFichier = null;
                    cb.onReceiveValue(null);
                    return false;
                }
                return true;
            }
        });

        web.addJavascriptInterface(new Pont(), "AndroidBridge");

        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl(ACCUEIL);
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQ_FICHIER && retourFichier != null) {
            Uri[] res = null;
            if (resultCode == RESULT_OK && data != null && data.getData() != null) {
                res = new Uri[]{ data.getData() };
            }
            retourFichier.onReceiveValue(res);
            retourFichier = null;
        }
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        web.evaluateJavascript("window.onAndroidBack ? String(window.onAndroidBack()) : 'false'", valeur -> {
            if (valeur == null || !valeur.contains("true")) finish();
        });
    }

    /** Pont appelé depuis le JavaScript de l'appli. */
    private class Pont {
        @JavascriptInterface
        public void sharePdf(String base64, String nom) {
            try {
                byte[] octets = Base64.decode(base64, Base64.DEFAULT);

                // 1) Copie dans le cache pour le partage
                File dossier = new File(getCacheDir(), "pdf");
                if (!dossier.exists()) dossier.mkdirs();
                File[] anciens = dossier.listFiles();
                if (anciens != null) for (File f : anciens) f.delete();
                File fichier = new File(dossier, nom);
                try (FileOutputStream fos = new FileOutputStream(fichier)) { fos.write(octets); }

                // 2) Copie dans « Téléchargements » (Android 10 et plus)
                boolean enregistre = false;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    try {
                        ContentResolver cr = getContentResolver();
                        ContentValues cv = new ContentValues();
                        cv.put(MediaStore.MediaColumns.DISPLAY_NAME, nom);
                        cv.put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf");
                        cv.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/Etudes securite");
                        Uri dest = cr.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, cv);
                        if (dest != null) {
                            try (OutputStream os = cr.openOutputStream(dest)) {
                                if (os != null) { os.write(octets); enregistre = true; }
                            }
                        }
                    } catch (Exception ignored) { }
                }

                final Uri uri = FileProvider.getUriForFile(MainActivity.this, getPackageName() + ".fileprovider", fichier);
                final boolean ok = enregistre;
                runOnUiThread(() -> {
                    if (ok) Toast.makeText(MainActivity.this,
                            "PDF enregistré dans Téléchargements / Etudes securite", Toast.LENGTH_LONG).show();
                    Intent envoi = new Intent(Intent.ACTION_SEND);
                    envoi.setType("application/pdf");
                    envoi.putExtra(Intent.EXTRA_STREAM, uri);
                    envoi.putExtra(Intent.EXTRA_SUBJECT, nom.replace(".pdf", "").replace('_', ' '));
                    envoi.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    Intent choix = Intent.createChooser(envoi, "Partager le rapport PDF");
                    choix.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    startActivity(choix);
                });
            } catch (Exception e) {
                runOnUiThread(() -> Toast.makeText(MainActivity.this,
                        "Erreur PDF : " + e.getMessage(), Toast.LENGTH_LONG).show());
            }
        }
    }
}
