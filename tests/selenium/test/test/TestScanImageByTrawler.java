package test;// Generated by Selenium IDE

import org.junit.Test;
import org.junit.runner.RunWith;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.events.EventFiringWebDriver;
import org.openqa.selenium.support.ui.WebDriverWait;
import runner.SeleniumTestRunner;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;

// *** Regular maintenance is required for all locators (locators can be changed with updated code) ***

@RunWith(SeleniumTestRunner.class)
public final class TestScanImageByTrawler {

  public static String login = System.getenv().getOrDefault("LOGIN", "super.admin@intelletive.com");
  public static String password = System.getenv().getOrDefault("PASSWORD", "123456");

  @Test
  public void scanimagebytrawler() throws Exception {

      ProcessBuilder builder = new ProcessBuilder();

      // pull trawler docker image if not already exists, then scan image alpine:latest with trawler CLI
      // *** url used here might need to be changed in pipeline ***
      builder.command("bash", "-c","docker run --network=host "+ SeleniumTestRunner.trawlerImageUrl +" trawler scan --url="+SeleniumTestRunner.altDockerBaseUrl+" --api-key='myapikey123456' --debug --parallel-scans=1 --cluster-name='default-cluster' --image-url='docker.io/alpine:latest' || true");
      builder.redirectErrorStream(true);

      Process process = builder.start();

      var exitCode = process.waitFor();

      BufferedReader bufferedReader = new BufferedReader(
              new InputStreamReader(process.getInputStream()));

      String outLine;
      while ((outLine = bufferedReader.readLine()) != null) {
          System.out.println("*** command line ***: "+ outLine);
      }

      // print exit code if any
      System.out.println("*** Process excited with code ***: "+ exitCode);

      // wait until element is visible
      EventFiringWebDriver driver = SeleniumTestRunner.driver;
      WebDriverWait myWaitVar = new WebDriverWait(driver, 4);  

      driver.get(SeleniumTestRunner.baseURL + "/public/login");
      Actions action = new Actions(driver);

      // move to auth box -> click -> find Local -> click
      action.moveToElement(driver.findElement(By.id("authenticationmethod"))).click().sendKeys("Local").sendKeys(Keys.ENTER).click().build().perform();
      // enter credentials
      driver.findElement(By.id("email")).sendKeys(login);
      driver.findElement(By.id("password")).sendKeys(password);
      driver.findElement(By.id("submit\'")).click();

      // sleep to load page
      Thread.sleep(5000);

      // select on m9sweeper-dev-cluster
      driver.findElement(By.xpath("//mat-card/div/span[contains(text(),'default-cluster')]")).click();
      // select Images
      driver.findElement(By.xpath("//mat-list/a[@title='Images']")).click();
      // click on the search bar
      driver.findElement(By.xpath("//div/mat-form-field/div/div[1]/div/input[@type='search']")).click();
      // enter image name on search bar
      driver.findElement(By.xpath("//div/mat-form-field/div/div[1]/div/input[@type='search']")).sendKeys("alpine:latest");
      // sleep to load search result
      Thread.sleep(1000);
      // click om the scanned image and see image details
      driver.findElement(By.xpath("(//mat-cell[contains(text(),'alpine:latest')])")).click();
      // sleep to load search result
      // scan maybe still running, sleep to load page
      //Thread.sleep(15000);

      // Is there a date in Date Scanned
      String lastScannedDateTime = driver.findElement(By.xpath("//div/div/div/p[contains(normalize-space(),'2022')]")).getText();
      if (lastScannedDateTime.length()> 0){
          System.out.println("*** The image was scanned at ***:" + lastScannedDateTime);
      } else {
          System.out.println("*** Not scan! ***");
      }

      // click on profile and log out
      driver.findElement(By.xpath("//span[contains(@class, 'mat-menu-trigger')]/img[contains(@class, 'profile')]")).click();
      driver.findElement(By.xpath("//span[contains(normalize-space(), 'Sign Out')]")).click();

  }
}
