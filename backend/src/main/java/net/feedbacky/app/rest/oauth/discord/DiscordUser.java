package net.feedbacky.app.rest.oauth.discord;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * @author Plajer
 * <p>
 * Created at 01.10.2019
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class DiscordUser {

  private long id;
  private String username;
  private String discriminator;
  private String avatar;
  private String email;
  private Boolean verified;

  public String getAvatar() {
    if(avatar == null) {
      return "https://static.plajer.xyz/img/avatars/" + (Integer.parseInt(discriminator) % 5) + ".jpg";
    }
    return "https://cdn.discordapp.com/avatars/" + id + "/" + avatar + ".jpg";
  }

}
